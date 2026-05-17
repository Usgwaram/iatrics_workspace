const {
  Provider,
  WalletTransaction,
} = require("../models");

const {
  getTransaction,
} = require("../utils/dbTransaction");

const PLATFORM_COMMISSION = 0.2; // 20%

function calculatePaymentSplit(amount) {
  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    throw new Error("Invalid payment amount");
  }

  const commission = Number((numericAmount * PLATFORM_COMMISSION).toFixed(2));
  const providerEarning = Number((numericAmount - commission).toFixed(2));

  return {
    amount: numericAmount,
    commission,
    providerEarning,
    commissionRate: PLATFORM_COMMISSION,
  };
}

// =====================================
// MAIN SPLIT PAYMENT
// =====================================
async function splitPayment({
  userId,
  providerId,
  amount,
  reference,
  consultationId = null,
  tx = null,
}) {
  const transaction = getTransaction(tx);
  const provider = await Provider.findByPk(providerId, { transaction });

  if (!provider) {
    throw new Error("Provider not found");
  }

  const { commission, providerEarning } = calculatePaymentSplit(amount);
  const providerUserId = provider.userId || providerId;

  // =========================
  // PROVIDER EARNING: 80%
  // =========================
  await WalletTransaction.create(
    {
      userId: providerUserId,
      amount: providerEarning,
      type: "credit",
      status: "confirmed",
      reference: `${reference}_PROVIDER`,
      source: "provider_earning",
    },
    { transaction }
  );

  // =========================
  // APP COMMISSION: 20%
  // =========================
  await WalletTransaction.create(
    {
      userId,
      amount: commission,
      type: "credit",
      status: "confirmed",
      reference: `${reference}_APP_COMMISSION`,
      source: "commission",
    },
    { transaction }
  );

  return {
    commission,
    commissionRate: PLATFORM_COMMISSION,
    consultationId,
    providerEarning,
  };
}

// =====================================
// MLM LEVEL COMMISSION (OPTIONAL EXTENSION)
// =====================================
async function payCommission({
  providerId,
  amount,
  level,
  sourceUserId,
  tx = null,
}) {
  const transaction = getTransaction(tx);

  await WalletTransaction.create(
    {
      userId: providerId,
      amount,
      type: "credit",
      status: "confirmed",
      reference: `MLM_LEVEL_${level}`,
      source: `mlm_commission_level_${level}_${sourceUserId || "unknown"}`,
    },
    { transaction }
  );
}

module.exports = {
  PLATFORM_COMMISSION,
  calculatePaymentSplit,
  splitPayment,
  payCommission,
};
