import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {
  deleteOldFileInCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { RescueOrg } from "../models/rescueOrganization.model.js";
import { Rescuer } from "../models/rescuer.model.js";
import { RescueReport } from "../models/rescueReport.model.js";
import jwt from "jsonwebtoken";
import { AnimalRescuer } from "../models/animalsRescuer.model.js";

const generateAccessAndRefreshTokens = async (orgId) => {
  try {
    const org = await RescueOrg.findById(orgId);
    const accessToken = org.generateAccessToken();
    const newRefreshToken = org.generateRefreshToken();

    org.refreshToken = newRefreshToken;
    await org.save({
      validateBeforeSave: false,
    });

    return { accessToken, newRefreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access tokens."
    );
  }
};
const registeredOrganizations = asyncHandler(async (req, res) => {
  const { orgName, phoneNumber, location, email, password } = req.body;

  if (
    [orgName, phoneNumber, location, email, password].some(
      (field) => field?.trim() === "" || field.trim() === undefined
    )
  ) {
    throw new ApiError(400, "All fields must be required");
  }

  const logoLocalPath = req.file?.path;

  if (!logoLocalPath) {
    throw new ApiError(400, "File path not found");
  }

  const logo = await uploadOnCloudinary(logoLocalPath);

  if (!logo) {
    throw new ApiError(500, "Something went wrong while uploading photo");
  }

  const org = await RescueOrg.create({
    orgName,
    phoneNumber,
    location,
    logo: logo.url,
    email,
    password,
  });

  if (!org) {
    throw new ApiError(
      500,
      " Something went wrong while registering organization"
    );
  }

  const organization = await RescueOrg.findById(org._id).select(
    "-password -refreshToken"
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, organization, "Organization successfully registered")
    );
});

const orgLogIn = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Both fields are required");
  }

  const org = await RescueOrg.findOne({
    $or: [{ email }],
  });

  const isPasswordValid = await org.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(
      400,
      "Password is invalid . Please enter the right password"
    );
  }

  const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(
    org._id
  );

  const loggedInOrg = await RescueOrg.findById(org._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          org: loggedInOrg,
          accessToken,
          refreshToken: newRefreshToken,
        },
        "User logged in successfully"
      )
    );
});

const logoutOrg = asyncHandler(async (req, res) => {
  RescueOrg.findByIdAndUpdate(
    req.org._id,
    {
      $unset: {
        refreshToken: 1, // This will remove the field from the document
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "Org logged out"));
});

const createRescuer = asyncHandler(async (req, res) => {
  const { rescuerName, phoneNumber, email, password } = req.body;

  if (
    [rescuerName, phoneNumber, email, password].some(
      (field) => field?.trim() === "" || field.trim() === undefined
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file not found");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Something went wrong uploading avatar");
  }

  const rescuer = await Rescuer.create({
    rescuerName,
    avatar: avatar.url,
    phoneNumber,
    org: req.org._id,
    email,
    password,
  });

  if (!rescuer) {
    throw new ApiError(400, "Something went wrong while creating rescuer");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, rescuer, "Rescuer created successfully"));
});

const changeCurrentOrgPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const org = await RescueOrg.findById(req.org?._id);

  const isPasswordValid = await org.isPasswordCorrect(oldPassword);

  // console.log("isPasswordValid", isPasswordValid);

  if (!isPasswordValid) {
    throw new ApiError(400, "Invalid password");
  }

  org.password = newPassword;
  await org.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password updated successfully"));
});

const changeOrganizationLogo = asyncHandler(async (req, res) => {
  const logoLocalPath = req.file?.path;

  if (!logoLocalPath) {
    throw new ApiError(401, "Avatar file is missing");
  }
  const oldLogo = req.org.logo;

  const logo = await uploadOnCloudinary(logoLocalPath);

  // console.log(logo);
  if (!logo.url) {
    throw new ApiError(500, "Something went wrong while uploading avatar");
  }

  const org = await RescueOrg.findByIdAndUpdate(
    req.org?._id,
    {
      $set: {
        logo: logo.url,
      },
    },
    {
      new: true,
    }
  ).select("-password -refreshToken");

  if (!org) {
    throw new ApiError(500, "Something went wrong or Org not found");
  }

  try {
    const isOldImageDelete = await deleteOldFileInCloudinary(oldLogo);
    // console.log("isOldImageDelete ", isOldImageDelete);
  } catch (error) {
    console.log("error - ", error);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, org, "Logo updated successfully"));
});

const removeTheRescuer = asyncHandler(async (req, res) => {
  // controller for the remove the rescuer from the organization

  const { rescuerId } = req.params;

  const org = await RescueOrg.findById(req.org._id);

  if (!org) {
    throw new ApiError(400, "Not Authenticated for this operation");
  }

  const deletedRescuer = await Rescuer.findByIdAndDelete(rescuerId);

  if (!deletedRescuer) {
    throw new ApiError(400, "Something went wrong while deleting rescuer");
  }

  try {
    const isOldImageDelete = await deleteOldFileInCloudinary(
      deletedRescuer.avatar
    );
    // console.log("isOldImageDelete ", isOldImageDelete);
  } catch (error) {
    console.log("error - ", error);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, deletedRescuer, "Rescuer deleted successfully"));
});

const rescueReport = asyncHandler(async (req, res) => {
  const { animalId } = req.params;

  const animalPicLocalPath = req.file?.path;

  const { description } = req.body;

  if (!description) {
    throw new ApiError(400, "The description was not provided");
  }

  if (!animalPicLocalPath) {
    throw new ApiError(400, "File not found");
  }

  const rescuedAnimalPic = await uploadOnCloudinary(animalPicLocalPath);

  if (!rescuedAnimalPic) {
    throw new ApiError(400, "Something went wrong uploading animalPic");
  }

  const rescuerReport = await RescueReport.create({
    rescuedAnimalPic: rescuedAnimalPic.url,
    animal: new mongoose.Types.ObjectId(animalId),
    description,
    org: new mongoose.Types.ObjectId(req.org?._id),
  });

  if (!rescuerReport) {
    throw new ApiError(
      400,
      "Something went wrong while creating rescuer report"
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, rescuerReport, "Rescuer Report Created Successfully")
    );
});

const getCurrentOrg = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.org, "Current user fetched successfully"));
});

const refreshAccessTokenOrg = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.org.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const org = await RescueOrg.findById(decodedToken?._id);

    if (!org) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== org?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshTokens(org._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken: newRefreshToken,
          },
          "Access token refreshed successfully"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

const getAllOrgRescuers = asyncHandler(async (req, res) => {
  const rescuerList = await Rescuer.aggregate([
    {
      $match: {
        org: new mongoose.Types.ObjectId(req.org?._id),
      },
    },
  ]);

  if (!rescuerList) {
    throw new ApiError(404, "Something went wrong or No rescuer Found ");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, rescuerList, " Rescuer list fetch successfully ")
    );
});

const getAllOrgRescuedAnimals = asyncHandler(async (req, res) => {
  const rescuedAnimalList = await AnimalRescuer.aggregate([
    {
      $lookup: {
        from: "rescueorgs",
        localField: "org",
        foreignField: "_id",
        as: "animalRescueByOrg",
      },
    },
    {
      $unwind: "$animalRescueByOrg", // Unwind the array created by $lookup
    },
    {
      $lookup: {
        from: "animals",
        localField: "animal",
        foreignField: "_id",
        as: "animalDetails",
      },
    },
    {
      $unwind: "$animalDetails", // Unwind the array created by $lookup
    },
    {
      $project: {
        "animalDetails._id": 1,
        "animalDetails.animalPicture": 1,
        "animalDetails.animalType": 1,
        "animalDetails.rescueStatus": 1,
        "animalDetails.createdAt": 1,
        "animalDetails.updatedAt": 1,
        "animalDetails.location": 1,
        "animalRescueByOrg._id": 1,
        "animalRescueByOrg.orgName": 1,
        "animalRescueByOrg.location": 1,
      },
    },
  ]);

  if (!rescuedAnimalList || rescuedAnimalList.length === 0) {
    throw new ApiError(
      404,
      "No rescued animals found or something went wrong."
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        rescuedAnimalList,
        "List of animals rescued by organizations fetched successfully."
      )
    );
});

export {
  registeredOrganizations,
  orgLogIn,
  logoutOrg,
  changeCurrentOrgPassword,
  changeOrganizationLogo,
  createRescuer,
  removeTheRescuer,
  rescueReport,
  getCurrentOrg,
  refreshAccessTokenOrg,
  getAllOrgRescuers,
  getAllOrgRescuedAnimals,
};
