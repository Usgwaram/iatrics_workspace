const express = require("express");
const router = express.Router();

const {
  register,
  login,
  getProfile,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

// ============================
// AUTH ROUTES
// ============================

// USER REGISTER
router.post("/users/register", register);

// USER LOGIN
router.post("/users/login", login);

// PROFILE
router.get("/me", protect, getProfile);

module.exports = router;