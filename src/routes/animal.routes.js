import { Router } from "express";
import {
  getAllAnimals,
  getAllUnrescuedAnimals,
} from "../controllers/animal.controller.js";

const router = Router();

router.route("/get-all-animals").get(getAllAnimals);
router.route("/get-notrescued-animals").get(getAllUnrescuedAnimals);

export default router;
