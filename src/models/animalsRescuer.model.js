import mongoose, { Schema, model } from "mongoose";

const animalRescuerSchema = new Schema(
  {
    animal: {
      type: Schema.Types.ObjectId,
      ref: "Animal",
    },
    rescuer: {
      type: Schema.Types.ObjectId,
      ref: "Rescuer",
    },
    org: {
      type: Schema.Types.ObjectId,
      ref: "Resc",
    },
  },
  { timestamps: true }
);

export const AnimalRescuer = model("AnimalRescuer", animalRescuerSchema);
