import { Router } from "express";
import {
  getPingResults,
  getResultById,
  getLatestPingResult,
} from "../controllers/resultsController.js";

const router = Router({ mergeParams: true });

router.route("/latest").get(getLatestPingResult);

router.route("/").get(getPingResults);
router.route("/:id").get(getResultById);

export default router;
