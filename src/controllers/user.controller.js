import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {
  deleteOldFileInCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const newRefreshToken = user.generateRefreshToken();

    user.refreshToken = newRefreshToken;
    await user.save({
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
const registerInformant = asyncHandler(async (req, res) => {
  const { fullName, username, phoneNumber, email, password } = req.body;

  if (
    [fullName, username, phoneNumber, email, password].some((field) => {
      field?.trim() === "" || field?.trim() === undefined;
    })
  ) {
    throw new ApiError(400, "All fields must be required");
  }

  // console.log("req.file ->", req);

  let avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const userExist = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (userExist) {
    throw new ApiError(409, "User with username or email already exists");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar) {
    throw new ApiError(500, "Something went wrong uploading avatar");
  }

  const user = await User.create({
    fullName: fullName,
    username: username,
    phoneNumber: phoneNumber,
    email: email,
    password: password,
    avatar: avatar.url,
  });

  const userCreated = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!userCreated) {
    throw new ApiError(500, "Something went wrong while registering user.");
  }

  return res
    .status(200)
    .json(new ApiResponse(201, userCreated, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  // console.log({ req });
  const { username, email, password } = req.body;

  // console.log({ username, email, password });

  if ((!email && !username) || !password) {
    throw new ApiError(400, "Username or email or password is required.");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  // console.log("isPasswordValid is " + isPasswordValid);

  if (!isPasswordValid) {
    throw new ApiError(401, "Passwords do not match");
  }

  const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
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
        201,
        {
          user: loggedInUser,
          accessToken,
          refreshToken: newRefreshToken,
        },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  // console.log("request for logout", req);
  User.findByIdAndUpdate(
    req.user._id,
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
    .json(new ApiResponse(200, {}, "User logged out"));
});

const changeCurrentUserPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  // console.log("req --> ", req);

  const user = await User.findById(req.user?._id);

  const isPasswordValid = await user.isPasswordCorrect(oldPassword);

  // console.log("isPasswordValid", isPasswordValid);

  if (!isPasswordValid) {
    throw new ApiError(400, "Invalid password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password updated successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(401, "Avatar file is missing");
  }

  const oldAvatar = req.user?.avatar;

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar.url) {
    throw new ApiError(500, "Something went wrong while uploading avatar");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    {
      new: true,
    }
  ).select("-password -refreshToken");

  if (!user) {
    throw new ApiError(500, "Something went wrong or User not found");
  }

  try {
    const isOldImageDelete = await deleteOldFileInCloudinary(oldAvatar);
    // console.log("isOldImageDelete ", isOldImageDelete);
  } catch (error) {
    console.log("error - ", error);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar updated successfully"));
});

// this is for users all created query
const getAllAnimalQuery = asyncHandler(async (req, res) => {
  const user = await Animal.aggregate([
    {
      $match: {
        informant: new mongoose.Types.ObjectId(req.user._id),
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Animal rescued fetched successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.user.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

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

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched successfully"));
});

export {
  registerInformant,
  loginUser,
  logoutUser,
  changeCurrentUserPassword,
  getAllAnimalQuery,
  updateUserAvatar,
  refreshAccessToken,
  getCurrentUser,
};
