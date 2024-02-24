import mongoose, { Schema, model } from "mongoose";

const animalSchema = new Schema(
  {
    animalType: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    breed: {
      type: String,
      trim: true,
      lowercase: true,
    },
    age: {
      type: Number,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
    },
    healthStatus: {
      type: String,
      required: true,
    },
    rescueStatus: {
      type: Boolean,
      required: true,
      default: false, // false -> not rescued , true -> rescued
    },
    location: {
      type: String,
      required: true,
    },
    animalPicture: {
      type: String,
      required: true,
    },
    informant: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Animal = model("Animal", animalSchema);
