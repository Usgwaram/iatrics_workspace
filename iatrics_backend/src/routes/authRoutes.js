const express = require("express");
const router = express.Router();

const {
  register,
  login,
  getProfile,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

// AUTH BASE: /api/auth

// CLEAN AUTH ROUTES
router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getProfile);

module.exports = router;