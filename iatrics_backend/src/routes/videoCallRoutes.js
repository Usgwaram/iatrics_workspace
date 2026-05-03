const express = require("express");
const router = express.Router();

const { authenticate } = require("../middleware/authMiddleware");
const requirePremium = require("../middleware/requirePremium");

// MVP video call endpoints

// Start video call
router.post("/start", authenticate, requirePremium, async (req, res) => {
  const { consultationId } = req.body;

  // Later: generate Agora token here
  res.json({
    message: "Video call started",
    consultationId,
    videoToken: "DUMMY_TOKEN_FOR_NOW",
  });
});

// End video call
router.post("/end", authenticate, requirePremium, async (req, res) => {
  const { consultationId } = req.body;

  res.json({
    message: "Video call ended",
    consultationId,
  });
});

module.exports = router;
