const express = require("express");
const router = express.Router();
const { handleWebhook } = require("../controllers/paystackWebhookController");

// req.rawBody is captured by express.json({ verify }) in server/app setup.
router.post(
  "/paystack",
  handleWebhook
);
module.exports = router;
