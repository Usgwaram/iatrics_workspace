const express = require("express");
const router = express.Router();

const {
  register,
  login,
  getProfile,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

// ============================
// AUTH ROUTES (CLEAN VERSION)
// ============================

// REGISTER USER
router.post("/register", register);

// LOGIN USER
router.post("/login", login);

// GET PROFILE
router.get("/me", protect, getProfile);

module.exports = router;