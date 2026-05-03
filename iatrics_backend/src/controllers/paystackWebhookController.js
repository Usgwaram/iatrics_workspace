const crypto = require("crypto");
const walletService = require("../services/walletService");

exports.handleWebhook = async (req, res) => {
  try {
    console.log("📩 Webhook received");

    const secret = process.env.PAYSTACK_SECRET_KEY;

    // 🔥 IMPORTANT: req.body is BUFFER (NOT object)
    const hash = crypto
      .createHmac("sha512", secret)
      .update(req.rawBody)   // ✅ CORRECT
      .digest("hex");

    const event = JSON.parse(req.rawBody.toString());

    if (hash !== req.headers["x-paystack-signature"]) {
      console.log("❌ Invalid signature");
      return res.status(401).send("Invalid signature");
    }



    if (event.event !== "charge.success") {
      return res.sendStatus(200);
    }

    const data = event.data;
    const reference = data.reference;
    const amount = data.amount / 100;
    const email = data.customer.email;

    const existing = await WalletTransaction.findOne({
      where: { reference },
    });

    if (existing) return res.sendStatus(200);

    const user = await User.findOne({ where: { email } });
    if (!user) return res.sendStatus(200);

    const { splitPayment } = require("../services/commissionService");

    // Instead of direct credit:
    await splitPayment({
      userId: user.id,
      providerId: user.id, // adjust when consultation exists
      amount,
      reference,
    });

    console.log("💰 Wallet credited:", amount);

    return res.sendStatus(200);

  } catch (err) {
    console.error("❌ Webhook error:", err);
    return res.sendStatus(500);
  }
};