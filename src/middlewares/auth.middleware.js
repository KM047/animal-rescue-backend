import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { RescueOrg } from "../models/rescueOrganization.model.js";
import { Rescuer } from "../models/rescuer.model.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
  // console.log("req in jwt", req);
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    // console.log({ token });

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select(
      "-password -accessToken"
    );

    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Access Token");
  }
});

export const verifyOrgJWT = asyncHandler(async (req, _, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const org = await RescueOrg.findById(decodedToken?._id).select(
      "-password -accessToken"
    );

    if (!org) {
      throw new ApiError(401, "Invalid Access Token");
    }

    req.org = org;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Access Token");
  }
});

export const verifyResJWT = asyncHandler(async (req, _, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const rescuer = await Rescuer.findById(decodedToken?._id).select(
      "-password -accessToken"
    );

    if (!rescuer) {
      throw new ApiError(401, "Invalid Access Token");
    }

    req.rescuer = rescuer;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Access Token"); //! No user is logged in
  }
});
