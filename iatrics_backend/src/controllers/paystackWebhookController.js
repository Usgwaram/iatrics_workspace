const crypto = require("crypto");

const {
  sequelize,
  WalletTransaction,
  User,
} = require("../models");

const walletService = require("../services/walletService");
const {
  splitPayment,
} = require("../services/commissionService");
const { paystackSecret } = require("../config/secrets");

// =====================================
// PAYSTACK WEBHOOK
// =====================================
exports.handleWebhook = async (req, res) => {
  const tx = await sequelize.transaction();

  try {
    console.log("📩 Webhook received");

    // =====================================
    // VERIFY SIGNATURE
    // =====================================
    const signature =
      req.headers["x-paystack-signature"];

    const hash = crypto
      .createHmac(
        "sha512",
        paystackSecret()
      )
      .update(req.rawBody)
      .digest("hex");

    if (hash !== signature) {
      await tx.rollback();

      console.log("❌ Invalid signature");

      return res.status(401).json({
        error: "Invalid signature",
      });
    }

    // =====================================
    // PARSE EVENT
    // =====================================
    const event = JSON.parse(
      req.rawBody.toString()
    );

    // Ignore unrelated events
    if (event.event !== "charge.success") {
      await tx.rollback();
      return res.sendStatus(200);
    }

    const data = event.data;

    const reference = data.reference;

    const amount = data.amount / 100;

    const email =
      data.customer?.email;

    const userId =
      data.metadata?.userId;
    const providerId =
      data.metadata?.providerId;
    const consultationId =
      data.metadata?.consultationId;

    // =====================================
    // IDEMPOTENCY CHECK
    // =====================================
    const existing =
      await WalletTransaction.findOne({
        where: { reference },
        transaction: tx,
        lock: tx.LOCK.UPDATE,
      });

    if (existing) {
      await tx.rollback();

      console.log(
        "⚠️ Transaction already processed"
      );

      return res.status(200).json({
        message: "Already processed",
      });
    }

    // =====================================
    // FIND USER
    // =====================================
    let user = null;

    if (userId) {
      user = await User.findByPk(userId, {
        transaction: tx,
      });
    }

    if (!user && email) {
      user = await User.findOne({
        where: { email },
        transaction: tx,
      });
    }

    if (!user) {
      await tx.rollback();

      console.log("❌ User not found");

      return res.status(404).json({
        error: "User not found",
      });
    }

    if (providerId) {
      await splitPayment({
        userId: user.id,
        providerId,
        amount,
        reference,
        consultationId,
        tx,
      });
    } else {
      // =====================================
      // WALLET TOP-UP: CREDIT FULL AMOUNT
      // =====================================
      await walletService.creditWallet({
        userId: user.id,
        amount,
        reference,
        source: "paystack",
        tx,
      });
    }

    // =====================================
    // COMMIT
    // =====================================
    await tx.commit();

    console.log(
      `💰 Wallet credited: ₦${amount}`
    );

    return res.sendStatus(200);

  } catch (err) {
    await tx.rollback();

    console.error(
      "❌ Webhook error:",
      err
    );

    return res.status(500).json({
      error: err.message,
    });
  }
};
