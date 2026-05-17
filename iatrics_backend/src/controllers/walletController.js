const axios = require("axios");

const { WalletTransaction, User } = require("../models");
const { paystackSecret } = require("../config/secrets");

function confirmedStatuses() {
  return ["confirmed"];
}

async function calculateBalance(userId, tx = global.testTransaction || null) {
  const credits =
    (await WalletTransaction.sum("amount", {
      where: { userId, type: "credit", status: confirmedStatuses() },
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
      return res.json({
        status: true,
        message: "Mock wallet top-up initialized",
        data: {
          authorization_url: "https://mock.paystack/wallet-topup",
          reference: `wallet_topup_${Date.now()}`,
          amount,
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
