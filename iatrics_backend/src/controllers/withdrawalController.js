const { User, WalletTransaction, Withdrawal, sequelize } = require("../models");
const payoutQueue = require("../queues/payoutQueue");

// ============================
// REQUEST WITHDRAWAL
// ============================
exports.requestWithdrawal = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { email, amount, accountNumber, bankCode } = req.body;

    const user = await User.findOne({ where: { email }, transaction: t });
    if (!user) {
      await t.rollback();
      return res.status(404).json({ error: "User not found" });
    }

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

    const reference = `WD_${Date.now()}`;

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

    await payoutQueue.add("processWithdrawal", {
      withdrawalId: withdrawal.id,
    });

    await t.commit();

    return res.json({
      message: "Withdrawal requested",
      withdrawal,
      balanceAfter: balance - amount,
    });

  } catch (err) {
    await t.rollback();
    console.error("Withdrawal error:", err);
    res.status(500).json({ error: "Failed" });
  }
};

// ============================
// GET PROVIDER WITHDRAWALS
// ============================
exports.getProviderWithdrawals = async (req, res) => {
  try {
    const { providerId } = req.params;

    const withdrawals = await Withdrawal.findAll({
      where: { userId: providerId },
      order: [["createdAt", "DESC"]],
    });

    res.json(withdrawals);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch withdrawals" });
  }
};