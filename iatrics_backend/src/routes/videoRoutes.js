const express = require("express");
const router = express.Router();

const { authenticate } = require("../middleware/authMiddleware");
const requirePremium = require("../middleware/requirePremium");

// ================= VIDEO CALL PREMIUM ROUTES =================

// Start video call
router.post("/start", authenticate, requirePremium, async (req, res) => {
  res.json({
    success: true,
    message: "Video call session started (premium access)",
  });
});

// Join video call
router.post("/join", authenticate, requirePremium, async (req, res) => {
  res.json({
    success: true,
    message: "Joined video call (premium access)",
  });
});

// End call
router.post("/end", authenticate, requirePremium, async (req, res) => {
  res.json({
    success: true,
    message: "Video call ended",
  });
});

module.exports = router;
