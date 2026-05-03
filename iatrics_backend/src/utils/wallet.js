const { WalletTransaction } = require("../models");

async function getWalletBalance(userId) {
  const credits = await WalletTransaction.sum("amount", {
    where: { userId, type: "credit", status: "confirmed" },
  });

  const debits = await WalletTransaction.sum("amount", {
    where: { userId, type: "debit", status: "confirmed" },
  });

  return (credits || 0) - (debits || 0);
}

module.exports = { getWalletBalance };