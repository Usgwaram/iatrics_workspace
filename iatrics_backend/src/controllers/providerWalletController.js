const walletService = require("../services/walletService");

exports.getProviderWallet = async (req, res) => {
  try {
    const balance = await walletService.getBalance(req.params.providerId);
    return res.json({ balance });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch wallet" });
  }
};

exports.creditProviderWallet = async (providerId, amount, consultationId) => {
  return walletService.creditWallet({
    userId: providerId,
    amount,
    source: "consultation",
    reference: `CONSULT_${consultationId || Date.now()}`,
  });
};

exports.creditProvider = async (req, res) => {
  try {
    const { providerId, amount } = req.body;

    await exports.creditProviderWallet(providerId, amount);

    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
