const { User, WalletTransaction, Withdrawal, sequelize } = require("../models");
//const payoutQueue = require("../queues/payoutQueue");

// ============================
// REQUEST WITHDRAWAL
// ============================
exports.requestWithdrawal = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { email, amount, accountNumber, bankCode } = req.body;

    // ============================
    // VALIDATION
    // ============================
    if (!email || !amount || !accountNumber || !bankCode) {
      await t.rollback();
      return res.status(400).json({ error: "All fields are required" });
    }

    if (amount <= 0) {
      await t.rollback();
      return res.status(400).json({ error: "Invalid amount" });
    }

    // ============================
    // FIND USER
    // ============================
    const user = await User.findOne({
      where: { email },
      transaction: t,
      lock: t.LOCK.UPDATE, // 🔒 prevents race conditions
    });

    if (!user) {
      await t.rollback();
      return res.status(404).json({ error: "User not found" });
    }

    // ============================
    // CALCULATE BALANCE
    // ============================
    const credits =
      (await WalletTransaction.sum("amount", {
        where: { userId: user.id, type: "credit", status: "success" },
        transaction: t,
      })) || 0;

    const debits =
      (await WalletTransaction.sum("amount", {
        where: { userId: user.id, type: "debit", status: "success" },
        transaction: t,
      })) || 0;

    const balance = credits - debits;

    if (balance < amount) {
      await t.rollback();
      return res.status(400).json({ error: "Insufficient balance" });
    }

    // ============================
    // CREATE RECORDS
    // ============================
    const reference = `WD_${Date.now()}_${user.id}`;

    const withdrawal = await Withdrawal.create(
      {
        userId: user.id,
        amount,
        accountNumber,
        bankCode,
        status: "pending",
        reference,
      },
      { transaction: t }
    );

    await WalletTransaction.create(
      {
        userId: user.id,
        type: "debit",
        amount,
        status: "pending",
        reference,
        source: "withdrawal",
      },
      { transaction: t }
    );

    // ============================
    // QUEUE OR FALLBACK
    // ============================
    if (payoutQueue) {
      console.log("⚠️ payoutQueue disabled in production");
    } else {
      console.log("⚠️ Queue disabled — marking as processing");

      withdrawal.status = "processing";
      await withdrawal.save({ transaction: t });
    }

    // ============================
    // COMMIT
    // ============================
    await t.commit();

    return res.json({
      message: "Withdrawal requested",
      withdrawal,
      balanceAfter: balance - amount,
    });

  } catch (err) {
    await t.rollback();
    console.error("❌ Withdrawal error:", err);

    return res.status(500).json({
      error: "Withdrawal failed",
    });
  }
};

// ============================
// GET PROVIDER WITHDRAWALS
// ============================
exports.getProviderWithdrawals = async (req, res) => {
  try {
    const { providerId } = req.params;

    if (!providerId) {
      return res.status(400).json({ error: "Provider ID required" });
    }

    const withdrawals = await Withdrawal.findAll({
      where: { userId: providerId },
      order: [["createdAt", "DESC"]],
    });

    return res.json(withdrawals);

  } catch (err) {
    console.error("❌ Fetch withdrawals error:", err);

    return res.status(500).json({
      error: "Failed to fetch withdrawals",
    });
  }
};
