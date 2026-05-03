const { User, sequelize } = require("../models");

async function debitUser(userId, amount) {
  const t = await sequelize.transaction();

  try {
    const user = await User.findByPk(userId, {
      lock: true,
      transaction: t,
    });

    if (!user) {
      console.log("❌ User not found:", userId);
      await t.rollback();
      return { success: false, reason: "USER_NOT_FOUND" };
    }

    if (user.balance == null) {
      console.log("⚠️ Balance field missing");
      await t.rollback();
      return { success: false, reason: "NO_BALANCE_FIELD" };
    }

    if (user.balance < amount) {
      console.log("⚠️ Insufficient balance:", userId);
      await t.rollback();
      return { success: false, reason: "INSUFFICIENT_BALANCE" };
    }


    user.balance -= amount;
    await user.save();

    console.log("💸 User debited:", userId, amount);

    return true;
  } catch (err) {
    console.error("❌ debitUser error:", err);
    return false;
  }
}

module.exports = { debitUser };