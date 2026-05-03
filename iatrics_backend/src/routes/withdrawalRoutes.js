
const router = require("express").Router();
const ctrl = require("../controllers/withdrawalController");

const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const validate = require("../middleware/validate");
const { withdrawalRules } = require("../validators/withdrawalValidator");

// ✅ Request withdrawal
router.post(
  "/request",
  auth,
  authorize("provider", "user"),
  withdrawalRules,
  validate,
  ctrl.requestWithdrawal
);

// ✅ Provider withdrawals (ONLY if controller exists)
router.get("/provider/:providerId", ctrl.getProviderWithdrawals);

module.exports = router;