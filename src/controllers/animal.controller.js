import mongoose, { isValidObjectId } from "mongoose";
import { Animal } from "../models/animal.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createAnimal = asyncHandler(async (req, res) => {
  const { animalType, breed, age, gender, healthStatus, location } = req.body;

  if (
    [animalType, breed, age, gender, healthStatus, location].some((field) => {
      field?.trim() === "" || field.trim() === undefined;
    })
  ) {
    throw new ApiError(400, "All fields are must be required");
  }

  let animalPicturePath;

  if (req.file) {
    animalPicturePath = req.file?.path;
  }

  if (!animalPicturePath) {
    throw new ApiError(400, "Animal picture required");
  }

  const animalPicture = await uploadOnCloudinary(animalPicturePath);

  const animal = await Animal.create({
    animalType,
    breed,
    age,
    gender,
    healthStatus,
    location,
    animalPicture: animalPicture.url,
    informant: new mongoose.Types.ObjectId(req.user._id),
  });

  if (!animal) {
    throw new ApiError(
      500,
      "Something went wrong while creating animal rescue query"
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { animal },
        "Animal rescue query successful created."
      )
    );
});

const getAllAnimals = asyncHandler(async (req, res) => {
  const { rescueStatus = false, page = 1, limit = 10 } = req.query;

  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);

  const skip = (pageNumber - 1) * limitNumber;

  const pipeline = [
    {
      $match: {
        rescueStatus: rescueStatus === "true", // Convert string to boolean
      },
    },
    {
      $skip: skip, // Skip documents based on pagination
    },
    {
      $limit: limitNumber, // Limit number of documents per page
    },
  ];

  const animals = await Animal.aggregate(pipeline);

  if (animals.length === 0) {
    throw new ApiError(404, "No animals found or something went wrong.");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        animals,
        `Page ${pageNumber} - Animals list with rescueStatus=${rescueStatus}`
      )
    );
});

const getAllUnrescuedAnimals = asyncHandler(async (req, res) => {
  const animals = await Animal.find();

  if (!animals) {
    throw new ApiError(404, "Something went wrong or No animal for rescued ");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, animals, " All animal list fetched successfully")
    );
});

export { createAnimal, getAllAnimals, getAllUnrescuedAnimals };
