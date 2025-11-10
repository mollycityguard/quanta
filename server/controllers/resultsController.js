import PingResult from "../db/models/pingResult.js";

export const getPingResults = async (req, res) => {
  try {
    const { monitorId, limit } = req.query;

    let whereCondition = {};
    const resultLimit = Math.min(parseInt(limit) || 100);

    if (monitorId) {
      whereCondition.monitorId = monitorId;
    }

    const results = await PingResult.findAll({
      where: whereCondition,
      limit: resultLimit,
      order: [["timestamp", "DESC"]],
    });

    return res.json(results);
  } catch (error) {
    if (
      error.message &&
      error.message.includes("invalid input syntax for type uuid")
    ) {
      return res.status(404).json({
        message: "Invalid Monitor ID format.",
      });
    }

    return res.status(500).json({
      message: "An internal server error occurred while fetching ping results.",
    });
  }
};

export const getResultById = async (req, res) => {
  try {
    const result = await PingResult.findByPk(req.params.id);

    if (!result) {
      return res.status(404).json({
        message: `Ping result with ID ${req.params.id} not found.`,
      });
    }
    return res.json(result);
  } catch (error) {
    if (
      error.message &&
      error.message.includes("invalid input syntax for type uuid")
    ) {
      return res.status(404).json({
        message: "Invalid Ping Result ID format.",
      });
    }

    return res.status(500).json({
      message: "An internal server error occurred.",
    });
  }
};

export const getLatestPingResult = async (req, res) => {
  const { monitorId } = req.params;

  if (!monitorId) {
    return res.status(400).json({ message: "Monitor ID is required." });
  }

  try {
    const latestResult = await PingResult.findOne({
      where: { monitorId },
      order: [["timestamp", "DESC"]],
    });

    if (!latestResult) {
      return res.status(404).json({
        message: `No ping results found for Monitor ID ${monitorId}.`,
      });
    }

    return res.json(latestResult);
  } catch (error) {
    if (
      error.message &&
      error.message.includes("invalid input syntax for type uuid")
    ) {
      return res.status(400).json({
        message: "Invalid Monitor ID format.",
      });
    }

    return res.status(500).json({
      message:
        "An internal server error occurred while fetching the latest ping result.",
    });
  }
};
