
const router = require("express").Router();
const ctrl = require("../controllers/withdrawalController");

const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const { withdrawalRules } = require("../validators/withdrawalValidator");

// ✅ Request withdrawal
router.post(
  "/request",
  protect,
  withdrawalRules,
  validate,
  ctrl.requestWithdrawal
);

// ✅ Logged-in user withdrawal history
router.get("/me", protect, ctrl.getMyWithdrawals);

// ✅ Provider withdrawals (ONLY if controller exists)
router.get("/provider/:providerId", ctrl.getProviderWithdrawals);

module.exports = router;
