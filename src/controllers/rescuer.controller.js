import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { RescueOrg } from "../models/rescueOrganization.model.js";
import { Rescuer } from "../models/rescuer.model.js";
import { Animal } from "../models/animal.model.js";
import { AnimalRescuer } from "../models/animalsRescuer.model.js";

const generateAccessAndRefreshTokens = async (rescuerId) => {
  try {
    const rescuer = await Rescuer.findById(rescuerId);
    const accessToken = rescuer.generateAccessToken();
    const newRefreshToken = rescuer.generateRefreshToken();

    rescuer.refreshToken = newRefreshToken;
    await rescuer.save({
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
const loginRescuer = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email && !password) {
    throw new ApiError(400, "All fields are required.");
  }

  const rescuer = await Rescuer.findOne({
    $or: [{ email }],
  });

  const isPasswordValid = await rescuer.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Passwords do not match");
  }

  const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(
    rescuer._id
  );

  const loggedInUser = await Rescuer.findById(rescuer._id).select(
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
          rescuer: loggedInUser,
          accessToken,
          refreshToken: newRefreshToken,
        },
        "Res logged in successfully"
      )
    );
});

const animalRescue = asyncHandler(async (req, res) => {
  // rescue the animal and also change the state of isRescued accordingly

  const { animalId } = req.params;

  if (!isValidObjectId(animalId) && !animalId) {
    throw new ApiError(404, "Invalid animal Identity");
  }

  const animal = await Animal.findById(animalId);

  if (!animal.rescueStatus) {
    animal.rescueStatus = true;

    await animal.save();

    if (!animal) {
      throw new ApiError(
        404,
        "Animal not found or something is wrong while updating animal rescue status"
      );
    }

    const animalRescue = await AnimalRescuer.create({
      animal: new mongoose.Types.ObjectId(animalId),
      rescuer: new mongoose.Types.ObjectId(req.rescuer._id),
      org: new mongoose.Types.ObjectId(req.rescuer.org),
    });

    if (!animalRescue) {
      throw new ApiError(
        500,
        "Something went wrong when trying to creating a new animal rescue"
      );
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, animalRescue, "Animal status updated successfully")
      );
  } else {
    throw new ApiError(404, "Animal rescued already");
  }
});

const changeCurrentRescuerPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const rescuer = await Rescuer.findById(req.rescuer?._id);

  const isPasswordValid = await rescuer.isPasswordCorrect(oldPassword);

  // console.log("isPasswordValid", isPasswordValid);

  if (!isPasswordValid) {
    throw new ApiError(400, "Invalid password");
  }

  rescuer.password = newPassword;
  await rescuer.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password updated successfully"));
});

const logoutRescuer = asyncHandler(async (req, res) => {
  Rescuer.findByIdAndUpdate(
    req.rescuer._id,
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
    .json(new ApiResponse(200, {}, "Rescuer logged out"));
});

const getallAnimalRescued = asyncHandler(async (req, res) => {
  const animals = await AnimalRescuer.aggregate([
    {
      $match: {
        rescuer: new mongoose.Types.ObjectId(req.rescuer?._id), // Using mongoose.Types.ObjectId directly
      },
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
        "animalDetails.createdAt": 1,
        "animalDetails.updatedAt": 1,
        "animalDetails.location": 1,
      },
    },
    {
      $group: {
        _id: null,
        animals: {
          $push: "$animalDetails",
        },
        total: {
          $sum: 1, // Count the number of documents
        },
      },
    },
    {
      $project: {
        _id: 0, // Exclude the _id field
        animals: 1,
        total: 1,
      },
    },
  ]);

  if (!animals || animals.length === 0) {
    throw new ApiError(404, "No animals found for the rescuer.");
  }

  return res.status(200).json(
    new ApiResponse(
      201,
      animals[0], // Return the first element of the array
      "All animals rescued by the rescuer fetched successfully"
    )
  );
});

const getCurrentRescuer = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(
      new ApiResponse(200, req.rescuer, "Current user fetched successfully")
    );
});

const changeRescuersAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(401, "Avatar file is missing");
  }
  const oldAvatar = req.rescuer.avatar;

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  // console.log(avatar);
  if (!avatar.url) {
    throw new ApiError(500, "Something went wrong while uploading avatar");
  }

  const rescuer = await Rescuer.findByIdAndUpdate(
    req.rescuer?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    {
      new: true,
    }
  ).select("-password -refreshToken");

  if (!rescuer) {
    throw new ApiError(500, "Something went wrong or Org not found");
  }

  try {
    const isOldImageDelete = await deleteOldFileInCloudinary(oldAvatar);
    // console.log("isOldImageDelete ", isOldImageDelete);
  } catch (error) {
    console.log("error - ", error);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, rescuer, "Logo updated successfully"));
});

export {
  loginRescuer,
  animalRescue,
  changeCurrentRescuerPassword,
  logoutRescuer,
  getallAnimalRescued,
  getCurrentRescuer,
  changeRescuersAvatar,
};
