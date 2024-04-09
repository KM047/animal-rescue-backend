import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const healthcheck = asyncHandler(async (req, res) => {
  // console.log("Health check");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { data: "The server is ready" },
        "The server is running well"
      )
    );
});

export { healthcheck };
