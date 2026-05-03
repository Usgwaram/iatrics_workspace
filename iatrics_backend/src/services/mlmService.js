const { User, Earning } = require("../models");

const COMMISSION_LEVELS = [0.1, 0.05, 0.03, 0.02, 0.01];
// 10%, 5%, 3%, 2%, 1%

async function distributeMLM({ userId, consultationId, amount }) {
  try {
    let currentUser = await User.findByPk(userId);

    for (let level = 0; level < 5; level++) {
      if (!currentUser?.referredBy) break;

      const refUser = await User.findByPk(currentUser.referredBy);

      if (!refUser) break;

      const commission = amount * COMMISSION_LEVELS[level];

      await Earning.create({
        userId: refUser.id,
        sourceUserId: userId,
        consultationId,
        amount: commission,
        level: level + 1,
        type: "referral_bonus",
      });

      console.log(`💰 Level ${level + 1} commission → User ${refUser.id}: ${commission}`);

      currentUser = refUser;
    }
  } catch (err) {
    console.error("MLM error:", err);
  }
}

module.exports = { distributeMLM };