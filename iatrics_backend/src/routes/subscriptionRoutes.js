const express = require("express");
const router = express.Router();

const { authenticate } = require("../middleware/authMiddleware");
const { getMySubscription } = require("../controllers/subscriptionController");

router.get("/me", authenticate, getMySubscription);

module.exports = router;   // ✅ MUST export router directly
