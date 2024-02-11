import mongoose, {Schema, model} from 'mongoose'

const informantSchema = new Schema(
    {
        name : {
            type : String,
            required : true,
            trim: true,
            lowercase: true,
        },
        username : {
            type : String,
            required : true,
            trim: true,
            lowercase: true,
            unique : true,
            index : true,
        },
        phoneNumber : {
            type : String,
            required : true,
            trim: true,
            unique : true,
        },
        email : {
            type : String,
            required : true,
            trim: true,
            lowercase: true,
            unique : true,
        },
        password : {
            type : String,
            required : true,
            trim: true,
            lowercase: true,
        }

    },{timestamps: true}
);

export const Informant = model("Informant", informantSchema);