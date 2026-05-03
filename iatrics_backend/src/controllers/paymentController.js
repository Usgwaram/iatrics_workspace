const crypto = require("crypto");
const { Earning } = require("../models");
const { distributeCommission } = require("../services/commissionService");
const { User } = require("../models");
const axios = require("axios");
const plans = require("../config/subscriptionPlans");

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

// Webhook endpoint
exports.paystackWebhook = async (req, res) => {
  try {
    // 1️⃣ Verify signature
    const hash = crypto
      .createHmac("sha512", PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (hash !== req.headers["x-paystack-signature"]) {
      console.warn("⚠️ Invalid Paystack signature");
      return res.status(400).send("Invalid signature");
    }

    const event = req.body;

    // 2️⃣ Only handle successful charge events
    if (event.event !== "charge.success") {
      return res.status(200).send("Event ignored");
    }

    const payment = event.data;

    // 3️⃣ Idempotency: prevent duplicate earnings
    const existing = await Earning.findOne({ where: { reference: payment.reference } });
    if (existing) return res.status(200).send("Already processed");

    // 4️⃣ Record earnings
    const user = await User.findOne({ where: { email: payment.customer.email } });
    if (!user) {
      console.error("User not found for payment:", payment.customer.email);
      return res.status(404).send("User not found");
    }

    const amount = payment.amount / 100; // NGN from kobo

    const earning = await Earning.create({
      userId: user.id,
      amount,
      source: "payment",
      reference: payment.reference,
      status: "confirmed",
    });

    console.log(`✅ Earning recorded: ${earning.id} for user ${user.email}`);

    // 5️⃣ Trigger MLM commission distribution
    await distributeCommission(user.id, amount);

    res.status(200).send("Webhook processed successfully");
  } catch (err) {
    console.error("🔥 Webhook processing error:", err);
    res.status(500).send("Server error");
  }
};

exports.initializeSubscriptionPayment = async (req, res) => {
  const { plan } = req.body;

  if (!plans[plan]) {
    return res.status(400).json({ message: "Invalid plan" });
  }

  const response = await axios.post(
    "https://api.paystack.co/transaction/initialize",
    {
      email: req.user.email,
      amount: plans[plan].amount,
      metadata: {
        userId: req.user.id,
        plan,
        purpose: "subscription",
      },
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    }
  );

  res.json(response.data.data); // contains authorization_url
};