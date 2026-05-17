const axios = require("axios");
const { handleWebhook } = require("./paystackWebhookController");
const { paystackSecret } = require("../config/secrets");

const SUBSCRIPTION_PLANS = {
  basic: 5000,
  premium: 15000,
};

exports.paystackWebhook = handleWebhook;

exports.initializeSubscriptionPayment = async (req, res) => {
  try {
    const { plan } = req.body;
    const amount = SUBSCRIPTION_PLANS[plan];

    if (!amount) {
      return res.status(400).json({ message: "Invalid plan" });
    }

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: req.user.email,
        amount: amount * 100,
        metadata: {
          userId: req.user.id,
          plan,
          purpose: "subscription",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${paystackSecret()}`,
        },
      }
    );

    return res.json(response.data.data);
  } catch (err) {
    return res.status(500).json({ error: "Payment initialization failed" });
  }
};
