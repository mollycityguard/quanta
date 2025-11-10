import { Router } from "express";
import {
  getPingResults,
  getResultById,
} from "../controllers/resultsController.js";

const router = Router();

router.route("/").get(getPingResults);
router.route("/:id").get(getResultById);

export default router;
