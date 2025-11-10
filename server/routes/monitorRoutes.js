import { Router } from "express";
import {
  getMonitors,
  getMonitorById,
  createMonitor,
  updateMonitor,
  deleteMonitor,
} from "../controllers/monitorController.js";

const router = Router();

router.route("/").get(getMonitors).post(createMonitor);

router
  .route("/:id")
  .get(getMonitorById)
  .put(updateMonitor)
  .delete(deleteMonitor);

export default router;
