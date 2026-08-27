const User = require("./User");
const Habit = require("./Habit");
const CheckIn = require("./CheckIn");

// User → Habit
User.hasMany(Habit, {
  foreignKey: "userId",
  as: "habits",
});

Habit.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

// Habit → CheckIn
Habit.hasMany(CheckIn, {
  foreignKey: "habitId",
  as: "checkIns",
});

CheckIn.belongsTo(Habit, {
  foreignKey: "habitId",
  as: "habit",
});

module.exports = {
  User,
  Habit,
  CheckIn,
};