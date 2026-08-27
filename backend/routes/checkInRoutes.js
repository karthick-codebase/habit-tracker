const express = require("express");

const {
  createCheckIn,
  getCheckIns,
  getCurrentStreak,
} = require("../controllers/checkInController");

const authenticate = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticate);

router.post("/:habitId/check-ins", createCheckIn);
router.get("/:habitId/check-ins", getCheckIns);
router.get("/:habitId/streak", getCurrentStreak);

module.exports = router;