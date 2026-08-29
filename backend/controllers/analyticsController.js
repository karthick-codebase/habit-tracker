const { Habit, CheckIn, User } = require("../models");
const { Op } = require("sequelize");
const { DateTime } = require("luxon");

function calculateStreakFromDates(dates, timezone) {
  if (!dates || dates.length === 0) {
    return 0;
  }

  const uniqueDates = [...new Set(dates)].sort(
    (a, b) => new Date(b) - new Date(a),
  );
  const mostRecent = uniqueDates[0];
  const today = DateTime.now().setZone(timezone).toISODate();
  const mostRecentDate = DateTime.fromISO(mostRecent).setZone(timezone);
  const todayDate = DateTime.fromISO(today).setZone(timezone);
  const yesterdayDate = todayDate.minus({ days: 1 }).toISODate();

  if (mostRecent !== today && mostRecent !== yesterdayDate) {
    return 0;
  }

  let streak = 1;
  let currentDate = mostRecentDate;

  for (let i = 1; i < uniqueDates.length; i += 1) {
    const expectedDate = currentDate.minus({ days: 1 }).toISODate();

    if (uniqueDates[i] === expectedDate) {
      streak += 1;
      currentDate = currentDate.minus({ days: 1 });
    } else {
      break;
    }
  }

  return streak;
}

function getLongestStreakForHabitDates(dateMap, timezone) {
  let longestStreak = 0;

  for (const dates of Object.values(dateMap)) {
    const streak = calculateStreakFromDates(dates, timezone);
    if (streak > longestStreak) {
      longestStreak = streak;
    }
  }

  return longestStreak;
}

/**
 * GET /api/analytics/overview
 * Get overall analytics for the authenticated user
 */
const getOverview = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findByPk(userId, {
      attributes: ["timezone"],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const timezone = user.timezone || "UTC";

    const habits = await Habit.findAll({
      where: { userId },
      attributes: ["id"],
    });

    const userHabitIds = habits.map((habit) => habit.id);
    const totalHabits = userHabitIds.length;

    const allCheckIns =
      userHabitIds.length > 0
        ? await CheckIn.findAll({
            where: {
              habitId: {
                [Op.in]: userHabitIds,
              },
            },
            attributes: ["habitId", "localDate"],
          })
        : [];

    const today = DateTime.now().setZone(timezone).toISODate();
    const todayCheckIns = allCheckIns.filter(
      (checkIn) => checkIn.localDate === today,
    ).length;

    const completionRateToday =
      totalHabits > 0 ? Math.round((todayCheckIns / totalHabits) * 100) : 0;

    const groupedByHabit = {};
    for (const checkIn of allCheckIns) {
      const habitId = String(checkIn.habitId);
      if (!groupedByHabit[habitId]) {
        groupedByHabit[habitId] = [];
      }
      groupedByHabit[habitId].push(checkIn.localDate);
    }

    const longestStreak = getLongestStreakForHabitDates(
      groupedByHabit,
      timezone,
    );

    const sevenDaysAgo = DateTime.now()
      .setZone(timezone)
      .minus({ days: 7 })
      .toISODate();
    const thirtyDaysAgo = DateTime.now()
      .setZone(timezone)
      .minus({ days: 30 })
      .toISODate();

    const last7DaysCheckIns = allCheckIns.filter(
      (checkIn) => checkIn.localDate >= sevenDaysAgo,
    ).length;

    const last30DaysCheckIns = allCheckIns.filter(
      (checkIn) => checkIn.localDate >= thirtyDaysAgo,
    ).length;

    return res.status(200).json({
      success: true,
      message: "Overview retrieved successfully",
      data: {
        overview: {
          totalHabits,
          totalCheckIns: allCheckIns.length,
          todayCheckIns,
          completionRateToday,
          longestStreak,
          last7DaysCheckIns,
          last30DaysCheckIns,
        },
      },
    });
  } catch (error) {
    console.error("Get overview error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve overview",
    });
  }
};

/**
 * GET /api/analytics/habits
 * Get statistics for each habit
 */
const getHabitStats = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findByPk(userId, {
      attributes: ["timezone"],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const timezone = user.timezone || "UTC";
    const habits = await Habit.findAll({
      where: { userId },
      attributes: ["id", "name", "description", "createdAt"],
      include: [
        {
          model: CheckIn,
          as: "checkIns",
          attributes: ["id", "localDate"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const thirtyDaysAgo = DateTime.now()
      .setZone(timezone)
      .minus({ days: 30 })
      .toISODate();

    const habitStats = habits.map((habit) => {
      const checkIns = Array.isArray(habit.checkIns) ? habit.checkIns : [];
      const dates = checkIns.map((checkIn) => checkIn.localDate);
      const totalCheckIns = dates.length;
      const currentStreak = calculateStreakFromDates(dates, timezone);

      const last30DaysCheckIns = dates.filter(
        (date) => date >= thirtyDaysAgo,
      ).length;

      const completionRate =
        totalCheckIns > 0 ? Math.round((last30DaysCheckIns / 30) * 100) : 0;

      const lastCheckIn =
        dates.length > 0 ? [...new Set(dates)].sort().at(-1) : null;

      return {
        id: habit.id,
        name: habit.name,
        description: habit.description,
        createdAt: habit.createdAt,
        totalCheckIns,
        currentStreak,
        completionRate,
        lastCheckIn,
      };
    });

    return res.status(200).json({
      success: true,
      message: "Habit statistics retrieved successfully",
      data: {
        habits: habitStats,
      },
    });
  } catch (error) {
    console.error("Get habit stats error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve habit statistics",
    });
  }
};

/**
 * GET /api/analytics/daily
 Get daily check-in trends for the last 30 days
 */
const getDailyTrends = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findByPk(userId, {
      attributes: ["timezone"],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const timezone = user.timezone || "UTC";

    const habits = await Habit.findAll({
      where: { userId },
      attributes: ["id"],
    });

    const userHabitIds = habits.map((habit) => habit.id);
    const totalHabits = userHabitIds.length;
    const today = DateTime.now().setZone(timezone);
    const startDate = today.minus({ days: 29 }).toISODate();

    const checkIns =
      userHabitIds.length > 0
        ? await CheckIn.findAll({
            where: {
              habitId: {
                [Op.in]: userHabitIds,
              },
              localDate: {
                [Op.gte]: startDate,
              },
            },
            attributes: ["localDate"],
          })
        : [];

    const countsByDate = {};
    for (const checkIn of checkIns) {
      countsByDate[checkIn.localDate] =
        (countsByDate[checkIn.localDate] || 0) + 1;
    }

    const dailyTrends = [];
    for (let i = 29; i >= 0; i -= 1) {
      const date = today.minus({ days: i }).toISODate();
      const dateLabel = today.minus({ days: i }).toLocaleString({
        month: "short",
        day: "numeric",
      });

      const checkInCount = countsByDate[date] || 0;
      const completionRate =
        totalHabits > 0 ? Math.round((checkInCount / totalHabits) * 100) : 0;

      dailyTrends.push({
        date,
        dateLabel,
        checkInCount,
        completionRate,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Daily trends retrieved successfully",
      data: {
        dailyTrends,
      },
    });
  } catch (error) {
    console.error("Get daily trends error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve daily trends",
    });
  }
};

/**
 * Helper function to calculate streak for a habit
 */
async function calculateStreak(habitId, timezone) {
  const checkIns = await CheckIn.findAll({
    where: { habitId },
    attributes: ["localDate"],
    order: [["localDate", "DESC"]],
  });

  if (checkIns.length === 0) {
    return 0;
  }

  const today = DateTime.now().setZone(timezone).toISODate();
  const checkInDates = checkIns.map((c) => c.localDate);

  // Sort dates in descending order
  checkInDates.sort((a, b) => new Date(b) - new Date(a));

  // Check if the most recent check-in is today or yesterday
  const mostRecent = checkInDates[0];
  const mostRecentDate = DateTime.fromISO(mostRecent).setZone(timezone);
  const todayDate = DateTime.fromISO(today).setZone(timezone);
  const yesterdayDate = todayDate.minus({ days: 1 }).toISODate();

  if (mostRecent !== today && mostRecent !== yesterdayDate) {
    return 0;
  }

  // Calculate streak
  let streak = 1;
  let currentDate = mostRecentDate;

  for (let i = 1; i < checkInDates.length; i++) {
    const expectedDate = currentDate.minus({ days: 1 }).toISODate();

    if (checkInDates[i] === expectedDate) {
      streak++;
      currentDate = currentDate.minus({ days: 1 });
    } else {
      break;
    }
  }

  return streak;
}

module.exports = {
  getOverview,
  getHabitStats,
  getDailyTrends,
};
