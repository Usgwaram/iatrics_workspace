const { Consultation, Wallet } = require("../models");

class BillingService {
  static async processTick({ channelName, userId, providerId }) {
    const charge = 50;

    const session = await Consultation.findOne({
      where: { channelName },
    });

    if (!session || session.status !== "active") return;

    // update consultation
    session.duration += 10;
    session.cost += charge;
    await session.save();

    // debit user
    const userWallet = await Wallet.findOne({
      where: { userId, role: "user" },
    });

    if (!userWallet || userWallet.balance < charge) return;

    userWallet.balance -= charge;
    await userWallet.save();

    // credit provider
    let providerWallet = await Wallet.findOne({
      where: { userId: providerId, role: "provider" },
    });

    if (!providerWallet) {
      providerWallet = await Wallet.create({
        userId: providerId,
        role: "provider",
        balance: 0,
      });
    }

    providerWallet.balance += charge;
    await providerWallet.save();
  }
}

module.exports = BillingService;