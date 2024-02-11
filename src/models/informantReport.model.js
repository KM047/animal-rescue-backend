import mongoose, {Schema, model} from "mongoose";

const informantReportSchema = new Schema(
    {
        informant : {
            type : Schema.Types.ObjectId,
            ref : "Informant"
        },
        animal : {
            type : Schema.Types.ObjectId,
            ref : "Animal"
        },
        description : {
            type : String,
            trim : true,
            required : true
        },
        org : {
            type : Schema.Types.ObjectId,
            ref : "RescueOrg"
        },
    }, {timestamps: true}
)

export const InformantReport = model("InformantReport", informantReportSchema)