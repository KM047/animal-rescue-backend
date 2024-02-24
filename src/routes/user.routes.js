import { Router } from "express";

import {
  registerInformant,
  loginUser,
  logoutUser,
  changeCurrentUserPassword,
  getAllAnimalQuery,
  updateUserAvatar,
  refreshAccessToken,
  getCurrentUser,
} from "../controllers/user.controller.js";

import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createAnimal } from "../controllers/animal.controller.js";

const router = Router();

router.route("/register").post(upload.single("avatar"), registerInformant);

router.route("/login").post(loginUser);

//! Secured router -> user logged in

router.route("/logout").post(verifyJWT, logoutUser);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/refresh-token").post(verifyJWT, refreshAccessToken);
router.route("/change-password").patch(verifyJWT, changeCurrentUserPassword);

router
  .route("/create-animal")
  .post(verifyJWT, upload.single("animalPicture"), createAnimal);
router.route("/get-all-animal").get(verifyJWT, getAllAnimalQuery);

router
  .route("/change-avatar")
  .patch(verifyJWT, upload.single("avatar"), updateUserAvatar);

export default router;
