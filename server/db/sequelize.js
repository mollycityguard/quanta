import { Sequelize } from "sequelize";
import "dotenv/config";

if (
  !process.env.DB_NAME ||
  !process.env.DB_USER ||
  !process.env.DB_PASS ||
  !process.env.DB_HOST ||
  !process.env.DB_PORT
) {
  throw new Error(
    "The environment variables (DB_NAME, DB_USER, DB_PASS, DB_HOST, DB_PORT) are not set. Check your .env file.",
  );
}

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    dialect: "postgres",
    logging: false,
  },
);

export default sequelize;
