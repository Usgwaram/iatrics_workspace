const express = require("express");
const router = express.Router();

const providerController = require("../controllers/providerController");
const onboardingController = require("../controllers/onboardingController");
const { protect } = require("../middleware/authMiddleware");

// ======================
// PROVIDER ROUTES
// ======================

// CREATE PROVIDER PROFILE
router.post("/", protect, providerController.createProvider);

// GET PROVIDER PROFILE
router.get("/me", protect, providerController.getProvider);

// PROVIDER ONBOARDING
router.get(
  "/:providerId/onboarding/status",
  protect,
  onboardingController.getStatus
);
router.post(
  "/:providerId/onboarding/profile",
  protect,
  onboardingController.updateProfile
);
router.post(
  "/:providerId/onboarding/documents",
  protect,
  onboardingController.uploadDocuments
);
router.post(
  "/:providerId/onboarding/bank",
  protect,
  onboardingController.completeBankSetup
);

module.exports = router;
