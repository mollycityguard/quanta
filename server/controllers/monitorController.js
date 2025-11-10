import {
  scheduleMonitor,
  cancelMonitor,
  rescheduleMonitor,
} from "../services/monitorService.js";
import Monitor from "../db/models/monitor.js";

export const getMonitors = async (req, res) => {
  try {
    const monitors = await Monitor.findAll({
      order: [["name", "ASC"]],
    });
    return res.json(monitors);
  } catch (error) {
    return res.status(500).json({
      message: "An internal server error occurred while fetching monitors.",
    });
  }
};

export const getMonitorById = async (req, res) => {
  try {
    const monitor = await Monitor.findByPk(req.params.id);

    if (!monitor) {
      return res.status(404).json({
        message: `Monitor with ID ${req.params.id} not found.`,
      });
    }
    return res.json(monitor);
  } catch (error) {
    return res.status(500).json({
      message: "An internal server error occurred.",
    });
  }
};

export const createMonitor = async (req, res) => {
  try {
    const { url, name, interval, isActive } = req.body;

    const newMonitor = await Monitor.create({
      url,
      name,
      interval,
      isActive: isActive !== undefined ? isActive : true,
    });

    if (newMonitor.isActive) {
      scheduleMonitor(newMonitor);
    }

    return res.status(201).json(newMonitor);
  } catch (error) {
    const statusCode =
      error.name === "SequelizeUniqueConstraintError" ? 409 : 400;

    return res.status(statusCode).json({
      message:
        statusCode === 409
          ? "A monitor with this URL or name already exists."
          : "Invalid data provided for monitor creation.",
      details: error.message,
    });
  }
};

export const updateMonitor = async (req, res) => {
  try {
    const monitorId = req.params.id;
    const [updatedRows, [updatedMonitor]] = await Monitor.update(req.body, {
      where: {
        id: monitorId,
      },
      returning: true,
    });

    if (updatedRows === 0) {
      return res.status(404).json({
        message: `Monitor with ID ${monitorId} not found.`,
      });
    }

    const { isActive } = updatedMonitor;

    if (isActive) {
      rescheduleMonitor(updatedMonitor);
    } else {
      cancelMonitor(monitorId);
    }

    return res.json(updatedMonitor);
  } catch (error) {
    return res.status(400).json({
      message: "Invalid data provided for monitor update.",
      details: error.message,
    });
  }
};

export const deleteMonitor = async (req, res) => {
  try {
    const monitorId = req.params.id;
    const deletedRows = await Monitor.destroy({
      where: {
        id: monitorId,
      },
    });

    if (deletedRows === 0) {
      return res.status(404).json({
        message: `Monitor with ID ${monitorId} not found.`,
      });
    }

    cancelMonitor(monitorId);

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({
      message: "An internal server error occurred during monitor deletion.",
    });
  }
};
