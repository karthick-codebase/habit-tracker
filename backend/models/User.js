const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },

    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    timezone: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  },
  {
    tableName: "users",
    timestamps: true,
  }
);

module.exports = User;