const { z } = require("zod");
const { Habit } = require("../models");

const normalizeHabitName = (value = "") =>
  value
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const createHabitSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Habit name is required")
    .max(100, "Habit name must not exceed 100 characters"),

  description: z
    .string()
    .trim()
    .max(1000, "Description must not exceed 1000 characters")
    .optional()
    .nullable(),
});

const updateHabitSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Habit name cannot be empty")
      .max(100, "Habit name must not exceed 100 characters")
      .optional(),

    description: z
      .string()
      .trim()
      .max(1000, "Description must not exceed 1000 characters")
      .optional()
      .nullable(),
  })
  .refine((data) => data.name !== undefined || data.description !== undefined, {
    message: "At least one field is required to update the habit",
  });

/**
 * POST /api/habits
 * Create a new habit
 */
const createHabit = async (req, res) => {
  try {
    const result = createHabitSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    const { name, description } = result.data;
    const normalizedName = normalizeHabitName(name);

    const habit = await Habit.create({
      userId: req.userId,
      name: normalizedName,
      description: description ?? null,
    });

    return res.status(201).json({
      success: true,
      message: "Habit created successfully",
      data: {
        habit: {
          id: habit.id,
          name: habit.name,
          description: habit.description,
          createdAt: habit.createdAt,
          updatedAt: habit.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error("Create habit error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create habit",
    });
  }
};

/**
 * GET /api/habits
 * Get all habits belonging to the authenticated user
 */
const getHabits = async (req, res) => {
  try {
    const habits = await Habit.findAll({
      where: {
        userId: req.userId,
      },
      order: [["createdAt", "DESC"]],
      attributes: ["id", "name", "description", "createdAt", "updatedAt"],
    });

    return res.status(200).json({
      success: true,
      message: "Habits retrieved successfully",
      data: {
        habits,
        count: habits.length,
      },
    });
  } catch (error) {
    console.error("Get habits error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve habits",
    });
  }
};

/**
 * GET /api/habits/:id
 * Get a single habit belonging to the authenticated user
 */
const getHabitById = async (req, res) => {
  try {
    const { id } = req.params;

    const habit = await Habit.findOne({
      where: {
        id,
        userId: req.userId,
      },
      attributes: ["id", "name", "description", "createdAt", "updatedAt"],
    });

    if (!habit) {
      return res.status(404).json({
        success: false,
        message: "Habit not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Habit retrieved successfully",
      data: {
        habit,
      },
    });
  } catch (error) {
    console.error("Get habit by ID error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve habit",
    });
  }
};

/**
 * PUT /api/habits/:id
 * Update a habit belonging to the authenticated user
 */
const updateHabit = async (req, res) => {
  try {
    const { id } = req.params;

    const result = updateHabitSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    const habit = await Habit.findOne({
      where: {
        id,
        userId: req.userId,
      },
    });

    if (!habit) {
      return res.status(404).json({
        success: false,
        message: "Habit not found",
      });
    }

    const { name, description } = result.data;

    if (name !== undefined) {
      habit.name = normalizeHabitName(name);
    }

    if (description !== undefined) {
      habit.description = description;
    }

    await habit.save();

    return res.status(200).json({
      success: true,
      message: "Habit updated successfully",
      data: {
        habit: {
          id: habit.id,
          name: habit.name,
          description: habit.description,
          createdAt: habit.createdAt,
          updatedAt: habit.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error("Update habit error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update habit",
    });
  }
};

/**
 * DELETE /api/habits/:id
 * Delete a habit belonging to the authenticated user
 */
const deleteHabit = async (req, res) => {
  try {
    const { id } = req.params;

    const habit = await Habit.findOne({
      where: {
        id,
        userId: req.userId,
      },
    });

    if (!habit) {
      return res.status(404).json({
        success: false,
        message: "Habit not found",
      });
    }

    await habit.destroy();

    return res.status(200).json({
      success: true,
      message: "Habit deleted successfully",
    });
  } catch (error) {
    console.error("Delete habit error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete habit",
    });
  }
};

module.exports = {
  createHabit,
  getHabits,
  getHabitById,
  updateHabit,
  deleteHabit,
};
