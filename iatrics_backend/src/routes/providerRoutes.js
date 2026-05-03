const express = require("express");
const router = express.Router();

const providerController = require("../controllers/providerController");
const { protect } = require("../middleware/authMiddleware");

// CREATE PROVIDER PROFILE
router.post(
  "/",
  protect,
  providerController.createProvider
);

// GET PROVIDER PROFILE
router.get(
  "/me",
  protect,
  providerController.getProvider
);

module.exports = router;