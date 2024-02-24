import mongoose, { Schema, model } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const rescueOrgSchema = new Schema(
  {
    orgName: {
      type: String,
      trim: true,
      index: true,
      required: true,
    },
    phoneNumber: {
      type: String,
      unique: true,
      trim: true,
      index: true,
      required: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    logo: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      trim: true,
      required: true,
      lowercase: true,
    },
    password: {
      type: String,
      trim: true,
      required: true,
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

rescueOrgSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

rescueOrgSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

rescueOrgSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.orgName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

rescueOrgSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const RescueOrg = model("RescueOrg", rescueOrgSchema);
