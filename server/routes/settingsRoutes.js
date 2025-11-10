import { Router } from "express";
import {
  getSettings,
  getSettingByKey,
  updateSettingByKey,
} from "../controllers/settingsController.js";

const router = Router();

router.route("/").get(getSettings);
router.route("/:key").get(getSettingByKey).put(updateSettingByKey);

export default router;
