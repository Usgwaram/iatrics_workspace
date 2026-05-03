const { WalletTransaction } = require("../models");

const PLATFORM_COMMISSION = 0.2; // 20%

exports.splitPayment = async ({ userId, providerId, amount, reference }) => {
  const commission = amount * PLATFORM_COMMISSION;
  const providerEarning = amount - commission;

  // 💰 Provider credit
  await WalletTransaction.create({
    userId: providerId,
    type: "credit",
    amount: providerEarning,
    status: "success",
    reference: `PROV_${reference}`,
    source: "consultation",
  });

  // 🏦 Platform revenue
  await WalletTransaction.create({
    userId: null,
    type: "credit",
    amount: commission,
    status: "success",
    reference: `PLAT_${reference}`,
    source: "commission",
  });

  return { providerEarning, commission };
};