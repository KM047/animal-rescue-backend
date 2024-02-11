import dotenv from "dotenv";

import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
    path : './.env'
})

connectDB()
.then(() => {
    app.on("error", () => {
        console.log("Error : " + error);
    })

    app.listen(process.env.PORT || 8001, () => {
        console.log(`⚙ Server listening on ${process.env.PORT}`)
    })
})

.catch((error) => {
    console.log(` Mongo db connection failed  !!!  ${error}`);
}) 
