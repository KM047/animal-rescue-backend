import mongoose, {Schema, model} from "mongoose";

const animalSchema = new Schema(
    {
        animalType : {
            type : String,
            required : true,
            trim : true,
            lowercase : true,
        },
        breed : {
            type : String,
            trim : true,
            lowercase : true,
        },
        age : {
            type : Number,
        },
        gender :{
            type : String,
            enum : ["male", "female"],
        },
        healthStatus : {
            type : String,
            required : true,
        },
        rescueStatus : {
            type : String,
            required : true,
        },
        location : {
            type : String,
            required : true,
        },
        animalPicture : {
            type : String,
            required : true,
        }
    }, { timestamps: true}
);

export const Animal = model("Animal", animalSchema);