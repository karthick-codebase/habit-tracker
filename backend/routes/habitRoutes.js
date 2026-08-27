const express = require("express");

const {
  createHabit,
  getHabits,
  getHabitById,
  updateHabit,
  deleteHabit,
} = require("../controllers/habitController");

const authenticate = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticate);

router.post("/", createHabit);
router.get("/", getHabits);
router.get("/:id", getHabitById);
router.put("/:id", updateHabit);
router.delete("/:id", deleteHabit);

module.exports = router;