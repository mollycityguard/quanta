import {
  useLoaderData,
  useRevalidator,
  Form,
  redirect,
  useActionData,
} from "react-router-dom";

import type { ActionFunctionArgs } from "react-router-dom";

import { useEffect, useState } from "react";

interface Monitor {
  id: string;

  name: string;

  url: string;

  interval: number;

  isActive: boolean;
}

interface PingResult {
  id: string;

  monitorId: string;

  status: "UP" | "DOWN" | string;

  statusCode: number | null;

  responseTime: number;

  timestamp: string;
}

interface MonitorDisplay extends Monitor {
  currentStatus: "UP" | "DOWN" | "UNKNOWN" | "INACTIVE";

  latestStatusCode: number | null;

  latestResponseTime: number | null;

  lastCheckedTime: string | null;
}

interface ActionResponse {
  success: boolean;

  errors?: { [key: string]: string };

  error?: string;

  intent?: "delete" | "create";
}

export async function loader() {
  const API_BASE = "http://localhost:3000/api";

  try {
    const monitorsResponse = await fetch(`${API_BASE}/monitors`);

    if (!monitorsResponse.ok) {
      throw new Error(`Error loading monitors: ${monitorsResponse.statusText}`);
    }

    const monitors: Monitor[] = await monitorsResponse.json();

    const dashboardMonitorsPromises = monitors.map(async (monitor) => {
      let currentStatus: MonitorDisplay["currentStatus"] = monitor.isActive
        ? "UNKNOWN"
        : "INACTIVE";

      let latestStatusCode: number | null = null;

      let latestResponseTime: number | null = null;

      let lastCheckedTime: string | null = null;

      if (!monitor.isActive) {
        return {
          ...monitor,

          currentStatus,

          latestStatusCode,

          latestResponseTime,

          lastCheckedTime,
        } as MonitorDisplay;
      }

      try {
        const pingResponse = await fetch(
          `${API_BASE}/monitors/${monitor.id}/pings/latest`,
        );

        if (pingResponse.ok) {
          const latestPing: PingResult = await pingResponse.json();

          currentStatus = latestPing.status === "UP" ? "UP" : "DOWN";

          latestStatusCode = latestPing.statusCode;

          latestResponseTime = latestPing.responseTime;

          lastCheckedTime = latestPing.timestamp;
        } else if (pingResponse.status === 404) {
          currentStatus = "UNKNOWN";
        }
      } catch (error) {
        currentStatus = "UNKNOWN";
      }

      return {
        ...monitor,

        currentStatus,

        latestStatusCode,

        latestResponseTime,

        lastCheckedTime,
      } as MonitorDisplay;
    });

    const dashboardMonitors: MonitorDisplay[] = await Promise.all(
      dashboardMonitorsPromises,
    );

    return { monitors: dashboardMonitors };
  } catch (error) {
    console.error("Error loading monitors:", error);

    return { monitors: [] };
  }
}

function validateNewMonitor(
  name: string,

  url: string,

  interval: number,
): { [key: string]: string } | null {
  const errors: { [key: string]: string } = {};

  if (!name || name.trim().length < 3) {
    errors.name = "Name must be at least 3 characters long.";
  }

  if (!url || !url.startsWith("http")) {
    errors.url = "URL must be a valid URL starting with http/https.";
  }

  if (!interval || interval < 1 || interval > 1440) {
    errors.interval = "Interval must be between 1 and 1440 minutes.";
  }

  return Object.keys(errors).length > 0 ? errors : null;
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  const intent = formData.get("intent") as "delete" | "create";

  const API_BASE = "http://localhost:3000/api";

  if (intent === "delete") {
    const monitorId = formData.get("monitorId") as string;

    if (!monitorId) {
      return {
        success: false,

        error: "Monitor ID is missing.",

        intent: "delete",
      };
    }

    try {
      const response = await fetch(`${API_BASE}/monitors/${monitorId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Deletion failed: ${response.statusText}`);
      }
    } catch (error) {
      return {
        success: false,

        error: (error as Error).message,

        intent: "delete",
      };
    }

    return redirect("/");
  }

  if (intent === "create") {
    const name = (formData.get("name") as string) || "";

    const url = (formData.get("url") as string) || "";

    const interval = parseInt(formData.get("interval") as string) || 0;

    const isActive = true;

    const errors = validateNewMonitor(name, url, interval);

    if (errors) {
      return { success: false, errors, intent: "create" };
    }

    try {
      const response = await fetch(`${API_BASE}/monitors`, {
        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({ name, url, interval, isActive }),
      });

      if (!response.ok) {
        throw new Error(`Creation failed: ${response.statusText}`);
      }
    } catch (error) {
      return {
        success: false,

        error: (error as Error).message,

        intent: "create",
      };
    }

    return { success: true, intent: "create" };
  }

  return { success: true };
}

export function meta() {
  return [
    { title: "Quanta Monitor" },

    { name: "description", content: "Overview of all tracked monitors." },
  ];
}

const MonitorDeleteForm = ({ monitorId }: { monitorId: string }) => {
  if (!monitorId) return null;

  const confirmDeletion = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!confirm("Are you sure you want to delete this monitor?")) {
      event.preventDefault();
    }
  };

  return (
    <Form method="post" onSubmit={() => {}}>
      <input type="hidden" name="monitorId" value={monitorId} />

      <input type="hidden" name="intent" value="delete" />

      <button
        type="submit"
        onClick={confirmDeletion}
        aria-label="Delete Monitor"
        className="cursor-pointer text-[#9a9a9b] hover:text-[#FA5252] transition duration-150 p-1 rounded-full bg-transparent focus:outline-none focus:ring-1 focus:ring-offset-0 focus:ring-[#FA5252]"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      </button>
    </Form>
  );
};

const MonitorCard = ({ monitor }: { monitor: MonitorDisplay }) => {
  let statusColor = "text-[#9a9a9b]";
  let statusBg = "bg-[#9a9a9b]/10";
  let statusText = "INACTIVE";
  let cardBorder = "border-[#9a9a9b]";

  if (monitor.isActive) {
    if (monitor.currentStatus === "UP") {
      statusColor = "text-[#40C057]";
      statusBg = "bg-[#40C057]/10";
      statusText = "UP";
      cardBorder = "border-[#40C057]";
    } else if (monitor.currentStatus === "DOWN") {
      statusColor = "text-[#FA5252]";
      statusBg = "bg-[#FA5252]/10";
      statusText = "DOWN";
      cardBorder = "border-[#FA5252]";
    } else {
      statusColor = "text-[#FAB005]";
      statusBg = "bg-[#FAB005]/10";
      statusText = "PENDING";
      cardBorder = "border-[#FAB005]";
    }
  }

  const responseTimeText =
    monitor.latestResponseTime !== null
      ? `${monitor.latestResponseTime} ms`
      : "N/A";

  let responseTimeColor = "text-[#9a9a9b]";

  if (monitor.latestResponseTime !== null && monitor.currentStatus !== "DOWN") {
    if (monitor.latestResponseTime > 1000) {
      responseTimeColor = "text-[#FA5252]";
    } else if (monitor.latestResponseTime > 500) {
      responseTimeColor = "text-[#FAB005]";
    } else {
      responseTimeColor = "text-[#40C057]";
    }
  } else if (monitor.currentStatus === "DOWN") {
    responseTimeColor = "text-[#FA5252]";
  } else {
    responseTimeColor = "text-[#9a9a9b]";
  }

  const lastCheckedText = monitor.lastCheckedTime
    ? new Date(monitor.lastCheckedTime).toLocaleTimeString()
    : "Never";

  return (
    <div
      className={`relative bg-[#0F0F11] p-6 rounded-xl border border-solid ${cardBorder} transition duration-300 overflow-hidden`}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-[#EEEEEE] truncate tracking-tight">
          {monitor.name}
        </h3>

        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusBg} ${statusColor} border border-transparent`}
        >
          {statusText}
        </span>
      </div>

      <div className="space-y-2 text-sm text-[#9a9a9b]">
        <p className="truncate">
          <span className="font-medium text-[#EEEEEE]">URL:</span> {monitor.url}
        </p>

        <p>
          <span className="font-medium text-[#EEEEEE]">Response Time:</span>{" "}
          <span className={`font-bold ${responseTimeColor}`}>
            {responseTimeText}
          </span>
        </p>

        {monitor.currentStatus === "DOWN" && monitor.latestStatusCode && (
          <p>
            <span className="font-medium text-[#EEEEEE]">Status Code:</span>{" "}
            <span className="font-bold text-[#FA5252]">
              {monitor.latestStatusCode}
            </span>
          </p>
        )}
      </div>

      <div className="flex justify-between items-center mt-5 pt-3 border-t border-dashed border-[#ffffff]">
        <p className="text-xs text-[#9a9a9b]">
          Last Checked: {lastCheckedText} \ Every {monitor.interval} min
        </p>

        <MonitorDeleteForm monitorId={monitor.id} />
      </div>
    </div>
  );
};

const AddMonitorCard = ({ onClick }: { onClick: () => void }) => {
  return (
    <div
      onClick={onClick}
      className="bg-[#0F0F11] p-6 rounded-xl border border-dashed border-[#9a9a9b] transition duration-300 hover:border-[#ffffff] cursor-pointer flex items-center justify-center h-full min-h-[200px]"
    >
      <div className="flex flex-col items-center text-[#9a9a9b] hover:text-[#EEEEEE] transition duration-300">
        <svg
          className="h-12 w-12 mb-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 4v16m8-8H4"
          />
        </svg>
      </div>
    </div>
  );
};

const NewMonitorModal = ({
  onClose,

  errors,
}: {
  onClose: () => void;

  errors: { [key: string]: string } | undefined;
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75">
      <div className="bg-[#121213] p-8 rounded-xl max-w-lg w-full m-4 border border-solid border-[#9a9a9b] relative">
        <Form method="post" className="space-y-4">
          <input type="hidden" name="intent" value="create" />

          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-[#9a9a9b] mb-1"
            >
              Name
            </label>

            <input
              type="text"
              id="name"
              name="name"
              required
              className={`w-full p-3 rounded-xl border border-solid bg-[#0B0B0D] text-[#EEEEEE] focus:outline-none focus:ring-0 focus:border-[#9a9a9b] focus:brightness-150 ${
                errors?.name ? "border-[#FA5252]" : "border-[#9a9a9b]"
              }`}
            />

            {errors?.name && (
              <p className="mt-1 text-xs text-[#FA5252]">{errors.name}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="url"
              className="block text-sm font-medium text-[#9a9a9b] mb-1"
            >
              URL
            </label>

            <input
              type="url"
              id="url"
              name="url"
              required
              placeholder="https://example.com"
              className={`w-full p-3 rounded-xl border border-solid bg-[#0B0B0D] text-[#EEEEEE] focus:outline-none focus:ring-0 focus:border-[#9a9a9b] focus:brightness-150 ${
                errors?.url ? "border-[#FA5252]" : "border-[#9a9a9b]"
              }`}
            />

            {errors?.url && (
              <p className="mt-1 text-xs text-[#FA5252]">{errors.url}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="interval"
              className="block text-sm font-medium text-[#9a9a9b] mb-1"
            >
              Ping Interval (minutes)
            </label>

            <input
              type="number"
              id="interval"
              name="interval"
              required
              min="1"
              max="1440"
              defaultValue="1"
              className={`w-full p-3 rounded-xl border border-solid bg-[#0B0B0D] text-[#EEEEEE] focus:outline-none focus:ring-0 focus:border-[#9a9a9b] focus:brightness-150 ${
                errors?.interval ? "border-[#FA5252]" : "border-[#9a9a9b]"
              }`}
            />

            {errors?.interval && (
              <p className="mt-1 text-xs text-[#FA5252]">{errors.interval}</p>
            )}
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 border border-dashed border-[#ffffff] cursor-pointer text-sm font-medium rounded-xl text-[#9a9a9b] bg-transparent hover:bg-[#9a9a9b]/10 transition duration-200"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="py-2 px-4 border border-dashed border-[#ffffff] text-sm font-medium rounded-xl text-[#FFFFFF] bg-transparent hover:bg-[#ffffff]/10 transition duration-200 cursor-pointer focus:outline-none focus:ring-0"
            >
              Create Monitor
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default function HomePage() {
  const { monitors } = useLoaderData() as { monitors: MonitorDisplay[] };

  const actionData = useActionData() as ActionResponse | undefined;

  const { revalidate } = useRevalidator();

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const intervalId = setInterval(() => {
      revalidate();
    }, 10000);

    return () => clearInterval(intervalId);
  }, [revalidate]);

  useEffect(() => {
    if (actionData && actionData.intent === "create") {
      if (actionData.success) {
        setIsModalOpen(false);

        revalidate();
      } else if (actionData.errors) {
        setIsModalOpen(true);
      }
    }
  }, [actionData, revalidate]);

  const creationErrors =
    actionData && actionData.intent === "create"
      ? actionData.errors
      : undefined;

  return (
    <main className="p-10 max-w-7xl mx-auto bg-[#0B0B0D] min-h-screen">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {monitors.length > 0 ? (
          monitors.map((monitor) => (
            <MonitorCard key={monitor.id} monitor={monitor} />
          ))
        ) : (
          <div className="text-[#9a9a9b] col-span-full p-8 bg-[#121213] border border-dashed border-[#ffffff] rounded-xl text-center">
            No monitors configured. Click "Add New Monitor" to get started.
          </div>
        )}

        {monitors.length > 0 && (
          <AddMonitorCard onClick={() => setIsModalOpen(true)} />
        )}
      </div>

      {isModalOpen && (
        <NewMonitorModal
          onClose={() => setIsModalOpen(false)}
          errors={creationErrors}
        />
      )}
    </main>
  );
}
