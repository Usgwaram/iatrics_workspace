const express = require("express");
const router = express.Router();

const {
  getUserEarnings,
  getAdminEarnings,
} = require("../controllers/earningController");

const {
  authenticate,
  requireRole,
} = require("../middleware/authMiddleware");

// 🔹 User earnings dashboard
router.get("/", authenticate, getUserEarnings);

// 🔹 Admin earnings + audit
router.get("/admin", authenticate, requireRole("admin"), getAdminEarnings);

module.exports = router; // 🔥 MUST be router
