import {
  Form,
  useLoaderData,
  useActionData,
  redirect,
  useRevalidator,
} from "react-router-dom";
import type { ActionFunctionArgs } from "react-router-dom";
import { useEffect } from "react";

import type { Route } from "./+types/home";
import { SettingKeys } from "./+types/Settings";
import type { SettingsMap } from "./+types/Settings";

const TELEGRAM_BOT_TOKEN = SettingKeys.TelegramBotToken;
const TELEGRAM_CHAT_ID = SettingKeys.TelegramChatId;

export async function loader({ request }: ActionFunctionArgs) {
  const API_BASE = "http://localhost:3000/api";
  const url = new URL(request.url);
  const saved = url.searchParams.get("saved");

  try {
    const tokenResponse = await fetch(
      `${API_BASE}/settings/${TELEGRAM_BOT_TOKEN}`,
    );
    const tokenExists = tokenResponse.ok;

    const chatIdResponse = await fetch(
      `${API_BASE}/settings/${TELEGRAM_CHAT_ID}`,
    );
    const chatIdExists = chatIdResponse.ok;

    return { tokenExists, chatIdExists, status: "OK", saved };
  } catch (error) {
    return {
      tokenExists: false,
      chatIdExists: false,
      status: "ERROR",
      error: (error as Error).message,
      saved: null,
    };
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const API_BASE = "http://localhost:3000/api";
  const formData = await request.formData();

  const token = formData.get("telegramToken") as string;

  const errors: { [key: string]: string } = {};
  let successCount = 0;

  if (token) {
    const response = await fetch(`${API_BASE}/settings/${TELEGRAM_BOT_TOKEN}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value: token }),
    });
    if (!response.ok) {
      errors.token =
        "Error saving the token. Make sure that the token is correct.";
    } else {
      successCount++;
    }
  } else {
    errors.token = "The token cannot be empty.";
  }

  if (Object.keys(errors).length > 0) {
    return new Response(JSON.stringify({ success: false, errors }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (successCount > 0) {
    return redirect("/settings?saved=true");
  }

  return new Response(JSON.stringify({ success: true, errors: {} }), {
    headers: { "Content-Type": "application/json" },
  });
}

export function meta() {
  return [
    { title: "Quanta Monitor | Settings" },
    { name: "description", content: "Telegram integration settings." },
  ];
}

export default function SettingsPage() {
  const { tokenExists, chatIdExists, status, error, saved } =
    useLoaderData() as {
      tokenExists: boolean;
      chatIdExists: boolean;
      status: "OK" | "ERROR";
      error?: string;
      saved: string | null;
    };

  const actionData = useActionData() as
    | { success: boolean; errors: { [key: string]: string } }
    | undefined;
  const errors = actionData?.errors || {};

  const isBotActive = tokenExists && chatIdExists;
  const isWaitingForChatId = tokenExists && !chatIdExists;

  const showInputForm = !tokenExists || isWaitingForChatId;

  const showSuccessSaveMessage = saved && isWaitingForChatId;

  const { revalidate } = useRevalidator();

  useEffect(() => {
    let intervalId: number | undefined;

    if (isWaitingForChatId) {
      intervalId = setInterval(() => {
        revalidate();
      }, 5000) as unknown as number;
    }

    return () => {
      if (intervalId !== undefined) {
        clearInterval(intervalId);
      }
    };
  }, [isWaitingForChatId, revalidate]);

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-[#FFFFFF]">
        Telegram Notification Settings
      </h1>

      {status === "ERROR" && (
        <div className="p-4 mb-6 bg-red-900/50 border border-[#F8604A]/50 text-[#F8604A] rounded-lg">
          Could not load current status. Error: {error}
        </div>
      )}

      {showSuccessSaveMessage && (
        <div className="p-4 mb-6 bg-green-900/50 border border-green-500/50 text-green-400 rounded-lg">
          The token has been saved successfully!
        </div>
      )}

      {actionData && !actionData.success && (
        <div className="p-4 mb-6 bg-red-900/50 border border-[#F8604A]/50 text-[#F8604A] rounded-lg">
          <p className="font-bold">Saving Error:</p>
          {errors.token && <p>Token: {errors.token}</p>}
        </div>
      )}

      {isBotActive && (
        <div className="p-6 mb-6 bg-[#222224] border-l-4 border-green-500 rounded-lg shadow-md flex items-center space-x-4">
          <svg
            className="h-6 w-6 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <h2 className="text-xl font-semibold text-[#FFFFFF]">
              Bot Connected Successfully
            </h2>
            <p className="text-[#808081]">
              Monitor status notifications will be sent to your Telegram chat.
            </p>
          </div>
        </div>
      )}

      {isWaitingForChatId && (
        <div className="p-6 mb-6 bg-[#222224] border-l-4 border-yellow-500 rounded-lg shadow-md flex items-center space-x-4">
          <svg
            className="animate-spin h-6 w-6 text-yellow-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <div>
            <h2 className="text-xl font-semibold text-[#FFFFFF]">
              Waiting for Activation
            </h2>
            <p className="text-[#808081]">
              Please send the{" "}
              <code className="bg-[#18181A] text-yellow-500 px-1 rounded">
                /start
              </code>{" "}
              command to your bot in Telegram to complete the connection.
            </p>
          </div>
        </div>
      )}

      {showInputForm && (
        <Form
          method="post"
          className="space-y-6 bg-[#222224] p-6 rounded-lg shadow-md border border-[#808081]/20"
        >
          <h2 className="text-xl font-semibold mb-4 text-[#F8604A]">
            {tokenExists
              ? "Update Telegram Bot Token"
              : "Enter Telegram Bot Token"}
          </h2>

          <div>
            <label
              htmlFor="telegramToken"
              className="block text-sm font-medium text-[#FFFFFF]"
            >
              Telegram Bot Token
            </label>
            <input
              type="text"
              id="telegramToken"
              name="telegramToken"
              required
              placeholder="Enter the bot's token (e.g., 123456:AAG2djQ123MaNGO5816)"
              className="mt-1 block w-full border border-[#808081]/50 bg-[#18181A] text-[#FFFFFF] rounded-md shadow-sm p-2 focus:border-[#F8604A] focus:ring-[#F8604A]"
            />
            <p className="mt-2 text-sm text-[#808081]">
              The token received from{" "}
              <a
                href="https://t.me/BotFather"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#F8604A] hover:text-white"
              >
                @BotFather
              </a>
              .
            </p>
          </div>

          <button
            type="submit"
            className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-[#FFFFFF] bg-[#F8604A] hover:bg-red-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#F8604A] focus:ring-offset-[#18181A]"
          >
            Save Token and Launch Bot
          </button>
        </Form>
      )}
    </main>
  );
}
