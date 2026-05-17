const axios = require("axios");
const { paystackSecret } = require("../config/secrets");

exports.initializePayment = async (req, res) => {
  try {
    const { email, amount, providerId, consultationId, purpose } = req.body;
    const metadata = {
      ...(providerId ? { providerId } : {}),
      ...(consultationId ? { consultationId } : {}),
      purpose: purpose || (providerId ? "consultation" : "wallet_topup"),
    };

    // 🧪 TEST MODE
    if (process.env.NODE_ENV !== "production") {
      console.log("⚠️ Mock Paystack init");

      return res.json({
        status: true,
        message: "Mock payment initialized",
        data: {
          authorization_url: "https://mock.paystack/authorize",
          reference: "mock_ref_123",
          amount,
          metadata,
        },
      });
    }

    // 🔴 REAL PAYSTACK (production only)
    const axios = require("axios");

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: amount * 100,
        metadata,
      },
      {
        headers: {
          Authorization: `Bearer ${paystackSecret()}`,
        },
      }
    );

    return res.json(response.data);

  } catch (err) {
    console.error("❌ PAYSTACK ERROR:", err.message);
    res.status(500).json({ error: "Payment failed" });
  }
};
