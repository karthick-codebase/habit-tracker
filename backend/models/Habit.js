const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Habit = sequelize.define(
  "Habit",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },

    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "habits",
    timestamps: true,
  },
);

module.exports = Habit;
