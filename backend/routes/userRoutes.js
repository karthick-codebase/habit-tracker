const express = require("express");

const {
  getUserProfile,
  updateUserProfile,
  changePassword,
  deleteAccount,
} = require("../controllers/userController");

const authenticate = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticate);

router.get("/", getUserProfile);
router.put("/", updateUserProfile);
router.put("/password", changePassword);
router.delete("/", deleteAccount);

module.exports = router;
