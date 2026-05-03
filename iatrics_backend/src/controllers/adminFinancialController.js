const { WalletTransaction, Withdrawal } = require("../models");
const { Op } = require("sequelize");
const { sequelize } = require("../models");
// ============================
// 📊 DASHBOARD SUMMARY
// ============================
exports.getSummary = async (req, res) => {
  try {
    const totalRevenue =
      (await WalletTransaction.sum("amount", {
        where: { source: "commission", status: "success" },
      })) || 0;

    const totalPayouts =
      (await Withdrawal.sum("amount", {
        where: { status: "success" },
      })) || 0;

    const pending =
      (await Withdrawal.sum("amount", {
        where: { status: "pending" },
      })) || 0;

    const failed =
      (await Withdrawal.sum("amount", {
        where: { status: "failed" },
      })) || 0;

    res.json({
      totalRevenue,
      totalPayouts,
      pending,
      failed,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed" });
  }
};


// ============================
// GET ALL WITHDRAWALS
// ============================
exports.getAllWithdrawals = async (req, res) => {
  const withdrawals = await Withdrawal.findAll({
    order: [["createdAt", "DESC"]],
  });

  res.json(withdrawals);
};

// ============================
// APPROVE WITHDRAWAL
// ============================
exports.approveWithdrawal = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const withdrawal = await Withdrawal.findByPk(req.params.id, { transaction: t });

    if (!withdrawal) {
      await t.rollback();
      return res.status(404).json({ error: "Not found" });
    }

    if (withdrawal.status !== "pending") {
      await t.rollback();
      return res.status(400).json({ error: "Already processed" });
    }

    // ✅ Mark success
    withdrawal.status = "success";
    await withdrawal.save({ transaction: t });

    // ✅ Update ledger (VERY IMPORTANT)
    await WalletTransaction.update(
      { status: "success" },
      {
        where: { reference: withdrawal.reference },
        transaction: t,
      }
    );

    await t.commit();

    res.json({ message: "Withdrawal approved" });

  } catch (err) {
    await t.rollback();
    console.error(err);
    res.status(500).json({ error: "Failed" });
  }
};
// ============================
// REJECT WITHDRAWAL
// ============================
exports.rejectWithdrawal = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const withdrawal = await Withdrawal.findByPk(req.params.id, { transaction: t });

    if (!withdrawal) {
      await t.rollback();
      return res.status(404).json({ error: "Not found" });
    }

    if (withdrawal.status !== "pending") {
      await t.rollback();
      return res.status(400).json({ error: "Already processed" });
    }

    withdrawal.status = "failed";
    await withdrawal.save({ transaction: t });

    // ✅ Refund user (ledger credit)
    await WalletTransaction.create({
      userId: withdrawal.userId,
      type: "credit",
      amount: withdrawal.amount,
      status: "success",
      reference: `REFUND_${Date.now()}`,
      source: "withdrawal_reversal",
    }, { transaction: t });

    await t.commit();

    res.json({ message: "Withdrawal rejected & refunded" });

  } catch (err) {
    await t.rollback();
    console.error(err);
    res.status(500).json({ error: "Failed" });
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const transactions = await WalletTransaction.findAll({
      order: [["createdAt", "DESC"]],
    });

    res.json(transactions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed" });
  }
};

exports.getWithdrawals = async (req, res) => {
  try {
    const withdrawals = await Withdrawal.findAll({
      order: [["createdAt", "DESC"]],
    });

    res.json(withdrawals);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed" });
  }
};
