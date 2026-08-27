const { DateTime } = require("luxon");
const { Op } = require("sequelize");
const { User, Habit, CheckIn } = require("../models");

/**
 * POST /api/habits/:habitId/check-ins
 * Create a check-in for the authenticated user's habit
 */
const createCheckIn = async (req, res) => {
  try {
    const { habitId } = req.params;

    // --------------------------------------------------
    // 1. Find the authenticated user
    // --------------------------------------------------

    const user = await User.findByPk(req.userId, {
      attributes: ["id", "timezone"],
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User account not found",
      });
    }

    // --------------------------------------------------
    // 2. Find the habit and verify ownership
    // --------------------------------------------------

    const habit = await Habit.findOne({
      where: {
        id: habitId,
        userId: req.userId,
      },
    });

    if (!habit) {
      return res.status(404).json({
        success: false,
        message: "Habit not found",
      });
    }

    // --------------------------------------------------
    // 3. Get the current UTC timestamp
    // --------------------------------------------------

    const checkedInAt = new Date();

    // --------------------------------------------------
    // 4. Convert current UTC time to user's timezone
    // --------------------------------------------------

    const localDateTime = DateTime
      .fromJSDate(checkedInAt, { zone: "utc" })
      .setZone(user.timezone);

    const localDate = localDateTime.toISODate();

    // --------------------------------------------------
    // 5. Make sure the local date is not before
    //    the habit's creation date
    // --------------------------------------------------

    const habitCreatedLocalDate = DateTime
      .fromJSDate(habit.createdAt, { zone: "utc" })
      .setZone(user.timezone)
      .toISODate();

    if (localDate < habitCreatedLocalDate) {
      return res.status(400).json({
        success: false,
        message: "Check-in date cannot be before the habit was created",
      });
    }

    // --------------------------------------------------
    // 6. Check whether this habit already has a
    //    check-in for this local calendar day
    // --------------------------------------------------

    const existingCheckIn = await CheckIn.findOne({
      where: {
        habitId: habit.id,
        localDate,
      },
    });

    if (existingCheckIn) {
      return res.status(409).json({
        success: false,
        message: "Habit is already checked in for this day",
        data: {
          checkIn: {
            id: existingCheckIn.id,
            checkedInAt: existingCheckIn.checkedInAt,
            localDate: existingCheckIn.localDate,
          },
        },
      });
    }

    // --------------------------------------------------
    // 7. Create the check-in
    // --------------------------------------------------

    const checkIn = await CheckIn.create({
      habitId: habit.id,
      checkedInAt,
      localDate,
    });

    // --------------------------------------------------
    // 8. Return success response
    // --------------------------------------------------

    return res.status(201).json({
      success: true,
      message: "Habit checked in successfully",
      data: {
        checkIn: {
          id: checkIn.id,
          habitId: checkIn.habitId,
          checkedInAt: checkIn.checkedInAt,
          localDate: checkIn.localDate,
        },
      },
    });
  } catch (error) {
    // --------------------------------------------------
    // Handle database unique constraint race condition
    // --------------------------------------------------

    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        success: false,
        message: "Habit is already checked in for this day",
      });
    }

    console.error("Create check-in error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create check-in",
    });
  }
};

/**
 * GET /api/habits/:habitId/check-ins
 * Get all check-ins belonging to the authenticated user's habit
 */
const getCheckIns = async (req, res) => {
  try {
    const { habitId } = req.params;

    // --------------------------------------------------
    // Verify habit ownership
    // --------------------------------------------------

    const habit = await Habit.findOne({
      where: {
        id: habitId,
        userId: req.userId,
      },
      attributes: ["id"],
    });

    if (!habit) {
      return res.status(404).json({
        success: false,
        message: "Habit not found",
      });
    }

    // --------------------------------------------------
    // Get check-ins
    // --------------------------------------------------

    const checkIns = await CheckIn.findAll({
      where: {
        habitId: habit.id,
      },
      attributes: [
        "id",
        "habitId",
        "checkedInAt",
        "localDate",
        "createdAt",
      ],
      order: [["localDate", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      message: "Check-ins retrieved successfully",
      data: {
        checkIns,
        count: checkIns.length,
      },
    });
  } catch (error) {
    console.error("Get check-ins error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve check-ins",
    });
  }
};

/**
 * GET /api/habits/:habitId/streak
 * Calculate the current streak based on local calendar dates
 */
const getCurrentStreak = async (req, res) => {
  try {
    const { habitId } = req.params;

    // --------------------------------------------------
    // 1. Get user timezone
    // --------------------------------------------------

    const user = await User.findByPk(req.userId, {
      attributes: ["id", "timezone"],
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User account not found",
      });
    }

    // --------------------------------------------------
    // 2. Verify habit ownership
    // --------------------------------------------------

    const habit = await Habit.findOne({
      where: {
        id: habitId,
        userId: req.userId,
      },
      attributes: ["id"],
    });

    if (!habit) {
      return res.status(404).json({
        success: false,
        message: "Habit not found",
      });
    }

    // --------------------------------------------------
    // 3. Get today's local date
    // --------------------------------------------------

    const today = DateTime
      .now()
      .setZone(user.timezone)
      .startOf("day");

    // --------------------------------------------------
    // 4. Get all check-in dates
    // --------------------------------------------------

    const checkIns = await CheckIn.findAll({
      where: {
        habitId: habit.id,
      },
      attributes: ["localDate"],
      order: [["localDate", "DESC"]],
    });

    if (checkIns.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Streak calculated successfully",
        data: {
          currentStreak: 0,
        },
      });
    }

    // --------------------------------------------------
    // 5. Convert database dates into a Set
    // --------------------------------------------------

    const checkInDates = new Set(
      checkIns.map((checkIn) => checkIn.localDate)
    );

    // --------------------------------------------------
    // 6. Determine the date from which the streak starts
    // --------------------------------------------------

    let streakStartDate = today;

    const todayString = today.toISODate();

    // If today has not been checked in,
    // allow the streak to continue from yesterday.
    if (!checkInDates.has(todayString)) {
      streakStartDate = today.minus({ days: 1 });
    }

    // --------------------------------------------------
    // 7. Count consecutive days
    // --------------------------------------------------

    let currentStreak = 0;
    let currentDate = streakStartDate;

    while (checkInDates.has(currentDate.toISODate())) {
      currentStreak += 1;
      currentDate = currentDate.minus({ days: 1 });
    }

    return res.status(200).json({
      success: true,
      message: "Streak calculated successfully",
      data: {
        currentStreak,
      },
    });
  } catch (error) {
    console.error("Get current streak error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to calculate streak",
    });
  }
};

module.exports = {
  createCheckIn,
  getCheckIns,
  getCurrentStreak,
};