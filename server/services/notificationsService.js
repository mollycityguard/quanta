import { Telegraf } from "telegraf";
import Settings from "../db/models/settings.js";

let botInstance = null;

async function getTelegramBot() {
  if (botInstance) {
    return botInstance;
  }

  const tokenRecord = await Settings.findOne({
    where: { key: "TELEGRAM_BOT_TOKEN" },
  });

  if (tokenRecord && tokenRecord.value) {
    botInstance = new Telegraf(tokenRecord.value);
    return botInstance;
  } else {
    console.warn(
      "Telegram bot token was not found in the database. Notifications are disabled.",
    );
    return null;
  }
}

export async function initializeBotListener() {
  const bot = await getTelegramBot();

  if (!bot) {
    return;
  }

  bot.start(async (ctx) => {
    const chatId = String(ctx.chat.id);
    const userName = ctx.from.username || "User";

    await Settings.upsert({
      key: "TELEGRAM_CHAT_ID",
      value: chatId,
    });

    console.log(`Chat ID (${chatId}) successfully saved for ${userName}.`);
    ctx.reply(`You have successfully enabled Quanta monitoring.`);
  });

  try {
    bot.launch();
    console.log(
      "Telegraf Listener is launched. Waiting for the /start to save the Chat ID.",
    );
  } catch (error) {
    console.error("Error launching Telegraf Listener:", error.message);
  }
}

export async function sendTelegramNotification(message) {
  const bot = await getTelegramBot();

  if (!bot) return;

  const chatIdRecord = await Settings.findOne({
    where: { key: "TELEGRAM_CHAT_ID" },
  });
  const chatId = chatIdRecord ? chatIdRecord.value : null;

  if (!chatId) {
    console.warn(
      "The Chat ID was not found in the database. Send the /start command to the bot.",
    );
    return;
  }

  try {
    await bot.telegram.sendMessage(chatId, message, {
      parse_mode: "HTML",
    });
    console.log(`The notification was successfully sent to the chat ${chatId}`);
  } catch (error) {
    console.error(`Error sending Telegram notification: ${error.message}`);
  }
}

export async function updateBotProfile() {
  const bot = await getTelegramBot();
  if (!bot) {
    return;
  }

  const newName = process.env.BOT_NAME;
  const newDescription = process.env.BOT_DESCRIPTION;

  if (newName) {
    try {
      await bot.telegram.setMyName(newName);
      console.log(`The bot name is set: ${newName}`);
    } catch (error) {
      console.error(`Bot name setting error: ${error.message}`);
    }
  }

  if (newDescription) {
    try {
      await bot.telegram.setMyDescription(newDescription);
      console.log(`The description of the bot has been successfully changed.`);
    } catch (error) {
      console.error(
        `Error changing the description of the bot: ${error.message}`,
      );
    }
  }
}
