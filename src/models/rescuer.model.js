import mongoose, {Schema, model} from "mongoose";

const rescuerSchema = new Schema(
    {
        rescuerName : {
            type : String,
            unique : true,
            index : true,
            trim : true,
        },
        avatar : {
            type : String,
        },
        phoneNumber : {
            type : String,
            unique : true,
            trim : true,
        },
        org : {
            type : Schema.Types.ObjectId,
            ref : "RescueOrg"
        }
    },{timestamps: true}
)

export const Rescuer = model('Rescuer', rescuerSchema)