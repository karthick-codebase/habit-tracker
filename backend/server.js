const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();
const sequelize = require("./config/database");
const authRoutes = require("./routes/authRoutes");
const authenticate = require("./middleware/authMiddleware");
const habitRoutes = require("./routes/habitRoutes");
const checkInRoutes = require("./routes/checkInRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// Allow frontend to communicate with backend
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

app.use("/api/auth", authRoutes);

app.get("/api/auth", authenticate, (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Authentication successful",
    data: {
      userId: req.userId,
    },
  });
});
app.use("/api/habits", habitRoutes);
app.use("/api/habits", checkInRoutes);

// Basic test route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Habit Tracker API is running",
  });
});

// Start server
const startServer = async () => {
  try {
    await sequelize.authenticate();

    console.log("Database connected successfully");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Unable to connect to the database:", error.message);
    process.exit(1);
  }
};

startServer();
