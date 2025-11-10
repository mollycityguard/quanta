import Settings from "../db/models/settings.js";
import {
  initializeBotListener,
  stopBotListener,
} from "../services/notificationsService.js";

const TELEGRAM_BOT_TOKEN = "TELEGRAM_BOT_TOKEN";
const TELEGRAM_CHAT_ID = "TELEGRAM_CHAT_ID";

export const getSettings = async (req, res) => {
  try {
    const settings = await Settings.findAll();
    const result = {};

    settings.forEach((setting) => {
      if (setting.key !== TELEGRAM_BOT_TOKEN) {
        result[setting.key] = setting.value;
      }
    });

    return res.json(result);
  } catch (error) {
    return res.status(500).json({
      message: "An internal server error occurred while fetching settings.",
    });
  }
};

export const getSettingByKey = async (req, res) => {
  try {
    const key = req.params.key;

    const setting = await Settings.findOne({ where: { key } });

    if (!setting) {
      return res.status(404).json({
        message: `Setting with key ${key} not found.`,
      });
    }

    if (key === TELEGRAM_BOT_TOKEN) {
      return res.json({ key: setting.key, value: "EXISTS" });
    }

    return res.json({ key: setting.key, value: setting.value });
  } catch (error) {
    return res.status(500).json({
      message: "An internal server error occurred.",
    });
  }
};

export const updateSettingByKey = async (req, res) => {
  try {
    const key = req.params.key;
    const { value } = req.body;

    if (!value) {
      return res.status(400).json({
        message: "Value is required for updating the setting.",
      });
    }

    if (key !== TELEGRAM_BOT_TOKEN && key !== TELEGRAM_CHAT_ID) {
      return res.status(400).json({
        message: `Invalid setting key: ${key}.`,
      });
    }

    const [setting, created] = await Settings.upsert(
      { key, value },
      { returning: true },
    );

    if (key === TELEGRAM_BOT_TOKEN) {
      await stopBotListener();
      await new Promise((resolve) => setTimeout(resolve, 1500));
      initializeBotListener();
    }

    return res.json({ key: setting.key, value: setting.value, created });
  } catch (error) {
    return res.status(400).json({
      message: "Invalid data provided for setting update.",
      details: error.message,
    });
  }
};
