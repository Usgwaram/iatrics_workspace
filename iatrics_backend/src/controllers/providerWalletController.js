const { ProviderWallet, WithdrawalRequest, WalletTransaction } = require("../models");

exports.getProviderWallet = async (req, res) => {
  const { providerId } = req.params;

  const wallet = await ProviderWallet.findOne({ where: { providerId } });

  res.json(wallet || { balance: 0 });
};

exports.creditProviderWallet = async (providerId, amount, consultationId) => {
  const wallet = await ProviderWallet.findOrCreate({
    where: { providerId },
    defaults: { balance: 0 }
  });

  wallet[0].balance = parseFloat(wallet[0].balance) + parseFloat(amount);
  await wallet[0].save();

  await WalletTransaction.create({
    walletType: "provider",
    providerId,
    type: "credit",
    amount,
    reason: "consultation",
    reference: consultationId
  });
};