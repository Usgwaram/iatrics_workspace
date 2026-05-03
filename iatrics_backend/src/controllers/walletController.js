const { WalletTransaction, User } = require("../models");

// ============================
// GET BALANCE (LOGGED IN USER)
// ============================
exports.getBalance = async (req, res) => {
  try {
    const userId = req.user.id;

    const credits = await WalletTransaction.sum("amount", {
      where: { userId, type: "credit", status: "success" },
    }) || 0;

    const debits = await WalletTransaction.sum("amount", {
      where: { userId, type: "debit", status: "success" },
    }) || 0;

    res.json({ balance: credits - debits });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed" });
  }
};

// ============================
// TOPUP
// ============================
exports.topupWallet = async (req, res) => {
  res.json({ message: "Topup endpoint working" });
};

// ============================
// DEDUCT
// ============================
exports.deductWallet = async (req, res) => {
  res.json({ message: "Deduct endpoint working" });
};

// ============================
// CREDIT
// ============================
exports.creditWallet = async (req, res) => {
  res.json({ message: "Credit endpoint working" });
};

// ============================
// BALANCE BY EMAIL
// ============================
exports.getBalanceByEmail = async (req, res) => {
  try {
    const user = await User.findOne({ where: { email: req.params.email } });

    if (!user) return res.status(404).json({ error: "User not found" });

    const credits = await WalletTransaction.sum("amount", {
      where: { userId: user.id, type: "credit", status: "success" },
    }) || 0;

    const debits = await WalletTransaction.sum("amount", {
      where: { userId: user.id, type: "debit", status: "success" },
    }) || 0;

    res.json({ balance: credits - debits });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed" });
  }
};