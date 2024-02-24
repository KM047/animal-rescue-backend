import mongoose, { Schema, model } from "mongoose";

const rescueReportSchema = new Schema(
  {
    rescuedAnimalPic: {
      type: String,
      trim: true,
    },
    animal: {
      type: Schema.Types.ObjectId,
      ref: "Animal",
      unique: true,
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    org: {
      type: Schema.Types.ObjectId,
      ref: "RescueOrg",
    },
  },
  { timestamps: true }
);

export const RescueReport = model("RescueReport", rescueReportSchema);
