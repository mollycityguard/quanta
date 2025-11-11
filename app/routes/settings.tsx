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
    { title: "Quanta Monitor" },
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

  const showSuccessSaveMessage = saved && isWaitingForChatId;
  const showFormAlways = true;

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
    <main className="p-10 max-w-4xl mx-auto bg-[#0B0B0D] min-h-screen">
      <h1 className="text-4xl font-extrabold mb-8 text-[#EEEEEE] tracking-tight">
        Telegram Notification Settings
      </h1>

      {status === "ERROR" && (
        <div className="p-4 mb-6 bg-[#FA5252]/10 border border-dashed border-[#FA5252]/50 text-[#FA5252] rounded-xl">
          Could not load current status. Error: {error}
        </div>
      )}

      {showSuccessSaveMessage && (
        <div className="p-4 mb-6 bg-[#40C057]/10 border border-dashed border-[#40C057]/50 text-[#40C057] rounded-xl">
          The token has been saved successfully!
        </div>
      )}

      {actionData && !actionData.success && (
        <div className="p-4 mb-6 bg-[#FA5252]/10 border border-dashed border-[#FA5252]/50 text-[#FA5252] rounded-xl">
          <p className="font-semibold">Saving Error:</p>
          {errors.token && <p>Token: {errors.token}</p>}
        </div>
      )}

      {isBotActive && (
        <div className="p-6 mb-6 bg-[#121213] border border-solid border-[#40C057] rounded-xl flex items-center space-x-4">
          <svg
            className="h-6 w-6 text-[#40C057]"
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
            <h2 className="text-xl font-semibold text-[#EEEEEE]">
              Bot Connected Successfully
            </h2>
            <p className="text-[#9a9a9b]">
              Monitor status notifications will be sent to your Telegram chat.
            </p>
          </div>
        </div>
      )}

      {isWaitingForChatId && (
        <div className="p-6 mb-6 bg-[#121213] border border-solid border-[#FAB005] rounded-xl flex items-center space-x-4">
          <svg
            className="animate-spin h-6 w-6 text-[#FAB005]"
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
            <h2 className="text-xl font-semibold text-[#EEEEEE]">
              Waiting for Activation
            </h2>
            <p className="text-[#9a9a9b]">
              Please send the{" "}
              <code className="bg-[#0B0B0D] text-[#FAB005] px-1 rounded">
                /start
              </code>{" "}
              command to your bot in Telegram to complete the connection.
            </p>
          </div>
        </div>
      )}

      {showFormAlways && (
        <Form
          method="post"
          className="space-y-6 bg-[#121213] p-8 rounded-xl border border-solid border-[#9a9a9b]"
        >
          <h2 className="text-xl font-semibold mb-4 text-[#EEEEEE]">
            {tokenExists
              ? "Update Telegram Bot Token"
              : "Enter Telegram Bot Token to Connect"}
          </h2>

          <div>
            <input
              type="text"
              id="telegramToken"
              name="telegramToken"
              required
              placeholder="Enter the bot's token (e.g., 123456:AAG2djQ123MaNGO5816)"
              className="mt-1 block w-full border border-solid border-[#9a9a9b] bg-[#0B0B0D] text-[#EEEEEE] rounded-xl p-3 focus:border focus:brightness-150 focus:outline-none focus:ring-0"
            />
            <p className="mt-2 text-sm text-[#9a9a9b]">
              The token received from{" "}
              <a
                href="https://t.me/BotFather"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#9a9a9b] hover:text-[#FFFFFF] transition duration-200"
              >
                @BotFather
              </a>
              .
            </p>
          </div>

          <button
            type="submit"
            className="w-full inline-flex justify-center py-3 px-4 border border-dashed border-[#ffffff] text-sm font-medium rounded-xl text-[#FFFFFF] bg-transparent hover:bg-[#ffffff]/10 transition duration-200 focus:outline-none focus:ring-0 cursor-pointer"
          >
            {tokenExists ? "Update Token" : "Save Token and Launch Bot"}
          </button>
        </Form>
      )}
    </main>
  );
}
