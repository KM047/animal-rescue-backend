import mongoose, {Schema, model} from "mongoose";

const rescueOrgSchema = new Schema(
    {
        orgName : {
            type : String,
            trim : true,
            index : true,
            required : true,
        },
        phoneNumber : {
            type : String,
            unique : true,
            trim : true,
            index : true,
            required : true,
        },
        location : {
            type : String,
            required : true,
            trim : true,
        },
        logo : {
            type : String,
            required : true,
        },
        email : {
            type : String,
            unique : true,
            trim : true,
            required : true,
            lowercase : true,

        },
        password : {
            type : String,
            trim : true,
            required : true,
            lowercase : true,
        },

    },{timestamps : true}
)


export const RescueOrg = model('RescueOrg', rescueOrgSchema)