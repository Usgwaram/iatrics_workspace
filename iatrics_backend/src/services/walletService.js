const { WalletLedger } = require("../models");

async function getBalance(userId) {
  const credits = await WalletLedger.sum("amount", {
    where: { userId, type: "credit" },
  }) || 0;

  const debits = await WalletLedger.sum("amount", {
    where: { userId, type: "debit" },
  }) || 0;

  return Number(credits) - Number(debits);
}

async function credit(userId, amount, reference, source, metadata = {}) {
  const balanceBefore = await getBalance(userId);
  const balanceAfter = balanceBefore + Number(amount);

  return WalletLedger.create({
    userId,
    type: "credit",
    amount,
    balanceAfter,
    reference,
    source,
    metadata,
  });
}

async function debit(userId, amount, reference, source, metadata = {}) {
  const balanceBefore = await getBalance(userId);

  if (balanceBefore < amount) {
    throw new Error("INSUFFICIENT_FUNDS");
  }

  const balanceAfter = balanceBefore - Number(amount);

  return WalletLedger.create({
    userId,
    type: "debit",
    amount,
    balanceAfter,
    reference,
    source,
    metadata,
  });
}

module.exports = {
  getBalance,
  credit,
  debit,
};