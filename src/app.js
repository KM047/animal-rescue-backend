import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

import userRouter from "./routes/user.routes.js";
import orgRouter from "./routes/rescue.org.routes.js";
import rescuerRouter from "./routes/rescuer.routes.js";
import animalRouter from "./routes/animal.routes.js";
import healthcheckRouter from "./routes/healthcheck.routes.js";

app.use("/api/v1/healthcheck", healthcheckRouter);
app.use("/", healthcheckRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/orgs", orgRouter);
app.use("/api/v1/rescuers", rescuerRouter);
app.use("/api/v1/animals", animalRouter);

export { app };
