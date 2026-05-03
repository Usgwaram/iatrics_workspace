const express = require("express");
const router = express.Router();
const { paystackWebhook } = require("../controllers/paymentController");

// This endpoint is called by Paystack directly
router.post("/webhook", paystackWebhook);

module.exports = router;
