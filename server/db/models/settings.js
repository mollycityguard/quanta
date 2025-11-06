import { DataTypes } from "sequelize";
import sequelize from "../sequelize.js";

const Settings = sequelize.define(
  "Settings",
  {
    key: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "Settings",
  },
);

export default Settings;
