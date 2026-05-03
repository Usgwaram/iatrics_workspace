const axios = require("axios");

exports.initializePayment = async (req, res) => {
  try {
    const { email, amount } = req.body;

    // 🧪 TEST MODE
    if (process.env.NODE_ENV !== "production") {
      console.log("⚠️ Mock Paystack init");

      return res.json({
        status: true,
        message: "Mock payment initialized",
        data: {
          authorization_url: "https://mock.paystack/authorize",
          reference: "mock_ref_123",
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
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    return res.json(response.data);

  } catch (err) {
    console.error("❌ PAYSTACK ERROR:", err.message);
    res.status(500).json({ error: "Payment failed" });
  }
};