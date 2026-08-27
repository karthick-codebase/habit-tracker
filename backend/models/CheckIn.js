const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const CheckIn = sequelize.define(
  "CheckIn",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },

    habitId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    checkedInAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    localDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
  },
  {
    tableName: "check_ins",
    timestamps: true,
  },
);

module.exports = CheckIn;
