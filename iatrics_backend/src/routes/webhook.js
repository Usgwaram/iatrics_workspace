const express = require("express");
const router = express.Router();
const { handleWebhook } = require("../controllers/paystackWebhookController");

// IMPORTANT: RAW BODY MUST COME FIRST
router.post(
  "/paystack",
  express.raw({ type: "*/*" }),
  handleWebhook
);
module.exports = router;