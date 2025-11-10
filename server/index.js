import express from "express";
import Monitor from "./db/models/monitor.js";
import PingResult from "./db/models/pingResult.js";
import sequelize from "./db/sequelize.js";
import monitorRoutes from "./routes/monitorRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import resultsRoutes from "./routes/resultsRoutes.js";
import { startMonitoring } from "./services/monitorService.js";
import {
  initializeBotListener,
  updateBotProfile,
} from "./services/notificationsService.js";

const app = express();
app.use(express.json());

app.use("/api/monitors", monitorRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/monitors/:monitorId/pings", resultsRoutes);

if (!process.env.EXPRESS_PORT || !process.env.DB_NAME) {
  throw new Error(
    "The environment variables (EXPRESS_PORT, DB_NAME) are not set. Check your .env file.",
  );
}

const PORT = parseInt(process.env.EXPRESS_PORT);

Monitor.hasMany(PingResult, {
  foreignKey: "monitorId",
  as: "results",
  onDelete: "CASCADE",
});

PingResult.belongsTo(Monitor, {
  foreignKey: "monitorId",
  as: "monitor",
});

async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    console.log(
      `The connection to the database (${process.env.DB_NAME}) was established successfully.`,
    );

    await sequelize.sync({ alter: true });

    await initializeBotListener();
    await updateBotProfile();

    await startMonitoring();

    app.listen(PORT, () => {
      console.log(`Express server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error(
      "Error when initializing the database and starting the server:",
      error,
    );
    process.exit(1);
  }
}

initializeDatabase();
