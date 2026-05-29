const axios = require("axios");

const {
  Provider,
  Sequelize,
  WalletTransaction,
  User,
  sequelize,
} = require("../models");
const { paystackSecret } = require("../config/secrets");
const walletService = require("../services/walletService");
const { splitPayment } = require("../services/commissionService");
const { calculateConsultationPrice } = require("../services/pricingEngine");

function confirmedStatuses() {
  return ["confirmed"];
}

async function calculateBalance(userId, tx = global.testTransaction || null) {
  const credits =
    (await WalletTransaction.sum("amount", {
      where: {
        userId,
        type: "credit",
        status: confirmedStatuses(),
        [Sequelize.Op.or]: [
          { source: null },
          { source: { [Sequelize.Op.ne]: "commission" } },
        ],
      },
      transaction: tx,
    })) || 0;

  const debits =
    (await WalletTransaction.sum("amount", {
      where: { userId, type: "debit", status: confirmedStatuses() },
      transaction: tx,
    })) || 0;

  return Number(credits) - Number(debits);
}

// ============================
// GET BALANCE (LOGGED IN USER)
// ============================
exports.getBalance = async (req, res) => {
  try {
    const userId = req.user.id;

    return res.json({ balance: await calculateBalance(userId) });
  } catch (err) {
    console.error("WALLET ERROR:", err);
    return res.status(500).json({ error: "Failed" });
  }
};

// ============================
// TRANSACTION HISTORY
// ============================
exports.getTransactions = async (req, res) => {
  try {
    const transactions = await WalletTransaction.findAll({
      where: { userId: req.user.id },
      order: [["createdAt", "DESC"]],
      transaction: global.testTransaction || undefined,
    });

    return res.json({ transactions });
  } catch (err) {
    console.error("WALLET TRANSACTIONS ERROR:", err);
    return res.status(500).json({ error: "Failed to fetch transactions" });
  }
};

// ============================
// TOPUP INITIALIZATION
// ============================
exports.topupWallet = async (req, res) => {
  try {
    const amount = Number(req.body.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ error: "Valid amount is required" });
    }

    const metadata = {
      userId: req.user.id,
      purpose: "wallet_topup",
    };

    if (process.env.NODE_ENV !== "production") {
      const reference = `wallet_topup_${Date.now()}_${req.user.id}`;
      const result = await walletService.creditWallet({
        userId: req.user.id,
        amount,
        reference,
        source: "paystack",
      });

      return res.json({
        status: true,
        message: "Mock wallet top-up initialized",
        data: {
          authorization_url: "https://mock.paystack/wallet-topup",
          reference,
          amount,
          balance: result.balance,
          metadata,
        },
      });
    }

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: req.user.email,
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
    console.error("WALLET TOPUP ERROR:", err.message);
    return res.status(500).json({ error: "Failed to initialize top-up" });
  }
};

// ============================
// DEDUCT
// ============================
exports.deductWallet = async (req, res) => {
  return res.json({ message: "Deduct endpoint working" });
};

// ============================
// CREDIT
// ============================
exports.creditWallet = async (req, res) => {
  return res.json({ message: "Credit endpoint working" });
};

exports.payProvider = async (req, res) => {
  const tx = await sequelize.transaction();

  try {
    const {
      providerId,
      amount,
      channelName,
      consultationId,
      type = "instant",
    } = req.body;

    const provider = await Provider.findByPk(providerId, { transaction: tx });

    if (!provider) {
      await tx.rollback();
      return res.status(404).json({ error: "Provider not found" });
    }

    const chargeAmount =
      Number.isFinite(Number(amount)) && Number(amount) > 0
        ? Number(amount)
        : calculateConsultationPrice({
            specialty: provider.specialty,
            yearsOfExperience: provider.yearsOfExperience,
            type,
          });

    const referenceBase =
      channelName ||
      consultationId ||
      `${req.user.id}_${providerId}_${Date.now()}`;
    const reference = `CONSULT_${referenceBase}`;

    const existing = await WalletTransaction.findOne({
      where: { reference: `${reference}_USER` },
      transaction: tx,
      lock: tx.LOCK.UPDATE,
    });

    if (existing) {
      const balance = await calculateBalance(req.user.id, tx);
      await tx.commit();
      return res.json({
        success: true,
        alreadyProcessed: true,
        balance,
      });
    }

    const debit = await walletService.debitWallet({
      userId: req.user.id,
      amount: chargeAmount,
      reference: `${reference}_USER`,
      source: "consultation",
      tx,
    });

    const split = await splitPayment({
      userId: req.user.id,
      providerId,
      amount: chargeAmount,
      reference,
      consultationId,
      tx,
    });

    await tx.commit();

    return res.json({
      success: true,
      amount: chargeAmount,
      balance: debit.balance,
      ...split,
    });
  } catch (err) {
    await tx.rollback();

    const status = err.message === "INSUFFICIENT_FUNDS" ? 402 : 500;
    return res.status(status).json({
      error:
        err.message === "INSUFFICIENT_FUNDS"
          ? "Insufficient wallet balance"
          : err.message,
    });
  }
};

// ============================
// BALANCE BY EMAIL (ADMIN)
// ============================
exports.getBalanceByEmail = async (req, res) => {
  try {
    const user = await User.findOne({
      where: { email: req.params.email },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({ balance: await calculateBalance(user.id) });
  } catch (err) {
    console.error("WALLET ERROR:", err);
    return res.status(500).json({ error: "Failed" });
  }
};

exports.calculateBalance = calculateBalance;
