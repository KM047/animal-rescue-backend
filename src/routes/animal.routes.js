import { Router } from "express";
import {
  getAllAnimals,
  getAllUnrescuedAnimals,
  getAnimalInfo,
} from "../controllers/animal.controller.js";

const router = Router();

router.route("/get-all-animals").get(getAllAnimals);
router.route("/get-notrescued-animals").get(getAllUnrescuedAnimals);
router.route("/animal-info/:animalId").get(getAnimalInfo);

export default router;
