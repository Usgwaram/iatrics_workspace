const { WalletTransaction } = require("../models");

async function getBalance(userId) {
  const credits = await WalletTransaction.sum("amount", {
    where: { userId, type: "credit" },
  }) || 0;

  const debits = await WalletTransaction.sum("amount", {
    where: { userId, type: "debit" },
  }) || 0;

  return credits - debits;
}

module.exports = { getBalance };