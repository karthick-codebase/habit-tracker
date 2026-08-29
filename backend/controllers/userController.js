const bcrypt = require("bcrypt");
const { z } = require("zod");
const { User, Habit, CheckIn } = require("../models");

// Helper function to validate IANA timezones
function isValidTimezone(timezone) {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch (err) {
    return false;
  }
}

// Zod validation schemas
const updateProfileSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please provide a valid email address")
    .max(255, "Email must not exceed 255 characters")
    .optional(),

  timezone: z
    .string()
    .trim()
    .min(1, "Timezone is required")
    .max(100, "Timezone is too long")
    .refine(isValidTimezone, {
      message: "Please provide a valid IANA timezone",
    })
    .optional(),
}).refine(
  (data) => data.email !== undefined || data.timezone !== undefined,
  {
    message: "At least one field is required to update",
  }
);

const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, "Current password is required")
    .max(72, "Current password must not exceed 72 characters"),

  newPassword: z
    .string()
    .min(8, "New password must be at least 8 characters")
    .max(72, "New password must not exceed 72 characters"),
});

/**
 * GET /api/user
 * Get current user profile
 */
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, {
      attributes: ["id", "email", "timezone", "createdAt"],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User profile retrieved successfully",
      data: {
        user: {
          id: user.id,
          email: user.email,
          timezone: user.timezone,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    console.error("Get user profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve user profile",
    });
  }
};

/**
 * PUT /api/user
 * Update user profile (email, timezone)
 */
const updateUserProfile = async (req, res) => {
  try {
    const result = updateProfileSchema.safeParse(req.body);

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

    const { email, timezone } = result.data;

    const user = await User.findByPk(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found",
      });
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const existingUser = await User.findOne({
        where: { email },
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "An account with this email already exists",
        });
      }

      user.email = email;
    }

    if (timezone) {
      user.timezone = timezone;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        user: {
          id: user.id,
          email: user.email,
          timezone: user.timezone,
          updatedAt: user.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error("Update user profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update profile",
    });
  }
};

/**
 * PUT /api/user/password
 * Change user password
 */
const changePassword = async (req, res) => {
  try {
    const result = changePasswordSchema.safeParse(req.body);

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

    const { currentPassword, newPassword } = result.data;

    const user = await User.findByPk(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found",
      });
    }

    const passwordMatches = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to change password",
    });
  }
};

/**
 * DELETE /api/user
 * Delete user account and all associated data
 */
const deleteAccount = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found",
      });
    }

    // Delete user (cascade will handle habits and check-ins)
    await user.destroy();

    return res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Delete account error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete account",
    });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  changePassword,
  deleteAccount,
};
