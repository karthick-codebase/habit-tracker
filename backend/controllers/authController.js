const bcrypt = require("bcrypt");
const { z } = require("zod");
const { User } = require("../models");
const jwt = require("jsonwebtoken");

// Helper function to validate IANA timezones
function isValidTimezone(timezone) {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch (err) {
    return false;
  }
}

// Zod validation schema
const registerSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please provide a valid email address")
    .max(255, "Email must not exceed 255 characters"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must not exceed 72 characters"),

  timezone: z
    .string()
    .trim()
    .min(1, "Timezone is required")
    .max(100, "Timezone is too long")
    .refine(isValidTimezone, {
      message: "Please provide a valid IANA timezone",
    }),
});

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please provide a valid email address")
    .max(255, "Email must not exceed 255 characters"),

  password: z
    .string()
    .min(1, "Password is required")
    .max(72, "Password must not exceed 72 characters"),
});

// Express controller handler
const register = async (req, res) => {
  try {
    const result = registerSchema.safeParse(req.body);

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

    const { email, password, timezone } = result.data;

    // Check if user already exists
    const existingUser = await User.findOne({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    // Hash the password safely
    const hashedPassword = await bcrypt.hash(password, 12);

    // Persist new user to the database
    const user = await User.create({
      email,
      password: hashedPassword,
      timezone,
    });

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
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
    console.error("Register error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create account",
    });
  }
};

const login = async (req, res) => {
  try {
    const result = loginSchema.safeParse(req.body);

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

    const { email, password } = result.data;

    const user = await User.findOne({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          timezone: user.timezone,
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to login",
    });
  }
};

module.exports = {
  register,login
};