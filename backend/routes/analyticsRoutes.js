const express = require("express");

const {
  getOverview,
  getHabitStats,
  getDailyTrends,
} = require("../controllers/analyticsController");

const authenticate = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticate);

router.get("/overview", getOverview);
router.get("/habits", getHabitStats);
router.get("/daily", getDailyTrends);

module.exports = router;
