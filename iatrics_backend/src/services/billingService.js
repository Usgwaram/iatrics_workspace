const { Consultation, sequelize } = require("../models");
const walletService = require("./walletService");

class BillingService {
  static async processTick({ channelName, userId, providerId }) {
    const charge = 50;
    const tx = await sequelize.transaction();

    try {
      const session = await Consultation.findOne({
        where: { channelName },
        transaction: tx,
        lock: tx.LOCK.UPDATE,
      });

      if (!session || session.status !== "active") {
        await tx.rollback();
        return null;
      }

      await walletService.debitWallet({
        userId,
        amount: charge,
        reference: `CONSULT_TICK_${session.id}_${Date.now()}`,
        source: "consultation",
        tx,
      });

      await walletService.creditWallet({
        userId: providerId,
        amount: charge,
        reference: `PROVIDER_TICK_${session.id}_${Date.now()}`,
        source: "consultation",
        tx,
      });

      session.duration = Number(session.duration || 0) + 10;
      session.cost = Number(session.cost || 0) + charge;
      await session.save({ transaction: tx });

      await tx.commit();
      return session;
    } catch (err) {
      await tx.rollback();
      throw err;
    }
  }
}

module.exports = BillingService;
