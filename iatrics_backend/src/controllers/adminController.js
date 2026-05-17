const { Op } = require("sequelize");
const {
  Provider,
  User,
  WalletTransaction,
  Withdrawal,
  sequelize,
} = require("../models");

const settledTransactionStatuses = ["confirmed"];

exports.getSummary = async (req, res) => {
  try {
    const [
      totalUsers,
      totalProviders,
      approvedProviders,
      pendingProviders,
      totalRevenue,
      totalPayouts,
      pendingWithdrawals,
      failedWithdrawals,
    ] = await Promise.all([
      User.count(),
      Provider.count(),
      Provider.count({ where: { isApproved: true } }),
      Provider.count({ where: { isApproved: false } }),
      WalletTransaction.sum("amount", {
        where: {
          source: "commission",
          status: { [Op.in]: settledTransactionStatuses },
        },
      }),
      Withdrawal.sum("amount", { where: { status: "success" } }),
      Withdrawal.sum("amount", { where: { status: "pending" } }),
      Withdrawal.sum("amount", { where: { status: "failed" } }),
    ]);

    return res.json({
      totalUsers,
      totalProviders,
      approvedProviders,
      pendingProviders,
      totalRevenue: totalRevenue || 0,
      totalPayouts: totalPayouts || 0,
      pendingWithdrawals: pendingWithdrawals || 0,
      failedWithdrawals: failedWithdrawals || 0,
    });
  } catch (err) {
    console.error("Admin summary error:", err);
    return res.status(500).json({ error: "Failed to fetch admin summary" });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password"] },
      order: [["createdAt", "DESC"]],
    });

    return res.json(users);
  } catch (err) {
    console.error("Admin users error:", err);
    return res.status(500).json({ error: "Failed to fetch users" });
  }
};

exports.getProviders = async (req, res) => {
  try {
    const providers = await Provider.findAll({
      order: [["createdAt", "DESC"]],
    });

    return res.json(providers);
  } catch (err) {
    console.error("Admin providers error:", err);
    return res.status(500).json({ error: "Failed to fetch providers" });
  }
};

exports.approveProvider = async (req, res) => {
  try {
    const provider = await Provider.findByPk(req.params.id);

    if (!provider) {
      return res.status(404).json({ error: "Provider not found" });
    }

    await provider.update({
      isApproved: true,
      onboardingStep: "APPROVED",
    });

    return res.json({
      message: "Provider approved",
      provider,
    });
  } catch (err) {
    console.error("Approve provider error:", err);
    return res.status(500).json({ error: "Failed to approve provider" });
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const transactions = await WalletTransaction.findAll({
      order: [["createdAt", "DESC"]],
    });

    return res.json(transactions);
  } catch (err) {
    console.error("Admin transactions error:", err);
    return res.status(500).json({ error: "Failed to fetch transactions" });
  }
};

exports.getWithdrawals = async (req, res) => {
  try {
    const withdrawals = await Withdrawal.findAll({
      order: [["createdAt", "DESC"]],
    });

    return res.json(withdrawals);
  } catch (err) {
    console.error("Admin withdrawals error:", err);
    return res.status(500).json({ error: "Failed to fetch withdrawals" });
  }
};

exports.approveWithdrawal = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const withdrawal = await Withdrawal.findByPk(req.params.id, {
      transaction: t,
    });

    if (!withdrawal) {
      await t.rollback();
      return res.status(404).json({ error: "Withdrawal not found" });
    }

    if (withdrawal.status !== "pending") {
      await t.rollback();
      return res.status(400).json({ error: "Withdrawal already processed" });
    }

    await withdrawal.update({ status: "success" }, { transaction: t });

    if (withdrawal.reference) {
      await WalletTransaction.update(
        { status: "confirmed" },
        {
          where: { reference: withdrawal.reference },
          transaction: t,
        }
      );
    }

    await t.commit();

    return res.json({ message: "Withdrawal approved" });
  } catch (err) {
    await t.rollback();
    console.error("Approve withdrawal error:", err);
    return res.status(500).json({ error: "Failed to approve withdrawal" });
  }
};

exports.rejectWithdrawal = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const withdrawal = await Withdrawal.findByPk(req.params.id, {
      transaction: t,
    });

    if (!withdrawal) {
      await t.rollback();
      return res.status(404).json({ error: "Withdrawal not found" });
    }

    if (withdrawal.status !== "pending") {
      await t.rollback();
      return res.status(400).json({ error: "Withdrawal already processed" });
    }

    await withdrawal.update({ status: "failed" }, { transaction: t });

    await WalletTransaction.create(
      {
        userId: withdrawal.userId,
        type: "credit",
        amount: withdrawal.amount,
        status: "confirmed",
        reference: `REFUND_${Date.now()}`,
        source: "withdrawal_reversal",
      },
      { transaction: t }
    );

    await t.commit();

    return res.json({ message: "Withdrawal rejected and refunded" });
  } catch (err) {
    await t.rollback();
    console.error("Reject withdrawal error:", err);
    return res.status(500).json({ error: "Failed to reject withdrawal" });
  }
};
