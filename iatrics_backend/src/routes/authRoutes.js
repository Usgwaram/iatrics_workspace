const express = require("express");
const router = express.Router();

const {
  register,
  login,
  getProfile,
  requestPasswordReset,
  resendVerification,
  resetPassword,
  verifyEmail,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");
const rateLimit = require("express-rate-limit");

const authActionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "test"
    ? Number(process.env.AUTH_RATE_LIMIT_MAX || 1000)
    : Number(process.env.AUTH_RATE_LIMIT_MAX || 10),
  standardHeaders: true,
  legacyHeaders: false,
});

// AUTH BASE: /api/auth

router.post("/register", register);
router.post("/login", login);
router.post("/verify-email", authActionLimiter, verifyEmail);
router.get("/verify-email", authActionLimiter, verifyEmail);
router.post("/resend-verification", authActionLimiter, resendVerification);
router.post("/password-reset/request", authActionLimiter, requestPasswordReset);
router.post("/password-reset/confirm", authActionLimiter, resetPassword);
router.get("/me", protect, getProfile);

module.exports = router;
