import { DataTypes } from "sequelize";
import sequelize from "../sequelize.js";

const PingResult = sequelize.define(
  "PingResult",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    monitorId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    statusCode: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    responseTime: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "PingResults",
    timestamps: false,
  },
);

export default PingResult;
