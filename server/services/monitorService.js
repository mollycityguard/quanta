import cron from "node-cron";
import axios from "axios";
import Monitor from "../db/models/monitor.js";
import PingResult from "../db/models/pingResult.js";
import { sendTelegramNotification } from "./notificationsService.js";

const activeJobs = new Map();

async function checkMonitor(monitor) {
  const startTime = Date.now();
  let status = "DOWN";
  let statusCode = null;
  let responseTime = 0;

  try {
    const response = await axios.get(monitor.url, { timeout: 10000 });

    responseTime = Date.now() - startTime;
    statusCode = response.status;

    if (statusCode >= 200 && statusCode < 400) {
      status = "UP";
    }
  } catch (error) {
    responseTime = Date.now() - startTime;
    statusCode = error.response ? error.response.status : null;
    status = "DOWN";
  }

  await PingResult.create({
    monitorId: monitor.id,
    status: status,
    statusCode: statusCode,
    responseTime: responseTime,
  });

  if (status === "DOWN") {
    const message = `Service "${monitor.name}" (${monitor.url}) is down! Code: ${
      statusCode || "No response"
    }. Response time: ${responseTime} ms.`;
    sendTelegramNotification(message);
    console.log(message);
  } else {
    console.log(
      `[${monitor.name}] UP. Code: ${statusCode}, Response time: ${responseTime} ms.`,
    );
  }
}

export function scheduleMonitor(monitor) {
  if (activeJobs.has(monitor.id)) {
    activeJobs.get(monitor.id).stop();
    activeJobs.delete(monitor.id);
  }

  const cronExpression = `*/${monitor.interval} * * * *`;

  const job = cron.schedule(
    cronExpression,
    () => {
      checkMonitor(monitor);
    },
    {
      scheduled: true,
    },
  );

  activeJobs.set(monitor.id, job);
  console.log(`Task is scheduled for "${monitor.name}": ${cronExpression}`);
}

export function cancelMonitor(monitorId) {
  if (activeJobs.has(monitorId)) {
    activeJobs.get(monitorId).stop();
    activeJobs.delete(monitorId);
    console.log(`Cron task for Monitor ID ${monitorId} has been canceled.`);
    return true;
  }
  return false;
}

export function rescheduleMonitor(monitor) {
  cancelMonitor(monitor.id);

  if (monitor.isActive) {
    scheduleMonitor(monitor);
    console.log(`Cron task for "${monitor.name}" updated and restarted.`);
  }
}

export async function startMonitoring() {
  try {
    activeJobs.forEach((job) => job.stop());
    activeJobs.clear();

    const monitors = await Monitor.findAll({
      where: { isActive: true },
    });

    if (monitors.length === 0) {
      console.log("There are no active monitoring services.");
      return;
    }

    monitors.forEach((monitor) => {
      scheduleMonitor(monitor);
    });

    console.log(
      `Monitoring is running. ${monitors.length} service(s) is being monitored.`,
    );
  } catch (error) {
    console.error("Error when starting monitoring:", error);
  }
}
