import { Router } from "express";

import {
  registeredOrganizations,
  orgLogIn,
  logoutOrg,
  changeCurrentOrgPassword,
  changeOrganizationLogo,
  createRescuer,
  removeTheRescuer,
  rescueReport,
  getCurrentOrg,
  refreshAccessTokenOrg,
  getAllOrgRescuers,
  getAllOrgRescuedAnimals,
} from "../controllers/organization.controller.js";

import { upload } from "../middlewares/multer.middleware.js";
import { verifyOrgJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(upload.single("logo"), registeredOrganizations);

router.route("/loginOrg").post(orgLogIn);

//! Secured router -> Org logged in

router.route("/current-org").get(verifyOrgJWT, getCurrentOrg);
router.route("/refresh-token").post(verifyOrgJWT, refreshAccessTokenOrg);
router.route("/logout").post(verifyOrgJWT, logoutOrg);
router
  .route("/add-rescuer")
  .post(verifyOrgJWT, upload.single("avatar"), createRescuer);
router.route("/rescuers").get(verifyOrgJWT, getAllOrgRescuers);
router.route("/rescued-animals").get(verifyOrgJWT, getAllOrgRescuedAnimals);
router
  .route("/remove-rescuer/:rescuerId")
  .delete(verifyOrgJWT, removeTheRescuer);
router.route("/change-password").patch(verifyOrgJWT, changeCurrentOrgPassword);
router
  .route("/change-logo")
  .patch(verifyOrgJWT, upload.single("logo"), changeOrganizationLogo);

router
  .route("/rescued-animal-report/:animalId")
  .post(verifyOrgJWT, upload.single("animalPic"), rescueReport);

export default router;
