import { Router } from "express";

import {
  loginRescuer,
  animalRescue,
  changeCurrentRescuerPassword,
  logoutRescuer,
  getallAnimalRescued,
  getCurrentRescuer,
  changeRescuersAvatar,
} from "../controllers/rescuer.controller.js";

import { upload } from "../middlewares/multer.middleware.js";
import { verifyResJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/login").post(loginRescuer);

//! Secured router -> user logged in

router.route("/current-rescuer").get(verifyResJWT, getCurrentRescuer);
router.route("/logout").post(verifyResJWT, logoutRescuer);
// router.route("/current-user").get(verifyResJWT, getCurrentUser);
// router.route("/refresh-token").post(verifyResJWT, refreshAccessToken);
router
  .route("/change-password")
  .patch(verifyResJWT, changeCurrentRescuerPassword);

router.route("/get-all-animal").get(verifyResJWT, getallAnimalRescued);
router.route("/rescued-animal/:animalId").post(verifyResJWT, animalRescue);
router
  .route("/change-avatar")
  .patch(verifyResJWT, upload.single("avatar"), changeRescuersAvatar);

export default router;
