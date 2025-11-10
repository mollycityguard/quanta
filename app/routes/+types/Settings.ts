export enum SettingKeys {
  TelegramBotToken = "TELEGRAM_BOT_TOKEN",
  TelegramChatId = "TELEGRAM_CHAT_ID",
}

export interface Setting {
  key: SettingKeys | string;
  value: string | null;

  createdAt: string;
  updatedAt: string;
}

export type SettingsMap = {
  [key in SettingKeys]?: string | null;
};
