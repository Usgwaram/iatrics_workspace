const {
  WalletTransaction,
} = require("../models");

const {
  getTransaction,
} = require("../utils/dbTransaction");

// =====================================
// GET BALANCE
// =====================================
async function getBalance(
  userId,
  tx = null
) {
  const transaction =
    getTransaction(tx);

  const credits =
    (await WalletTransaction.sum("amount", {
      where: {
        userId,
        type: "credit",
        status: "confirmed",
      },
      transaction,
    })) || 0;

  const debits =
    (await WalletTransaction.sum("amount", {
      where: {
        userId,
        type: "debit",
        status: "confirmed",
      },
      transaction,
    })) || 0;

  return (
    Number(credits) -
    Number(debits)
  );
}

// =====================================
// CREDIT WALLET
// =====================================
async function creditWallet({
  userId,
  amount,
  reference,
  source,
  metadata = {},
  tx = null,
}) {
  const transaction =
    getTransaction(tx);

  const newBalance =
    Number(await getBalance(userId, transaction)) +
    Number(amount);

  await WalletTransaction.create(
    {
      userId,
      type: "credit",
      amount,
      reference,
      source,
      status: "confirmed",
    },
    {
      transaction,
    }
  );

  return { balance: newBalance };
}

// =====================================
// DEBIT WALLET
// =====================================
async function debitWallet({
  userId,
  amount,
  reference,
  source,
  metadata = {},
  tx = null,
}) {
  const transaction =
    getTransaction(tx);

  const currentBalance = Number(await getBalance(userId, transaction));

  if (
    currentBalance <
    Number(amount)
  ) {
    throw new Error(
      "INSUFFICIENT_FUNDS"
    );
  }

  const newBalance =
    currentBalance -
    Number(amount);

  await WalletTransaction.create(
    {
      userId,
      type: "debit",
      amount,
      reference,
      source,
      status: "confirmed",
    },
    {
      transaction,
    }
  );

  return { balance: newBalance };
}

module.exports = {
  getBalance,
  creditWallet,
  debitWallet,
};
