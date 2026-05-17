const { Withdrawal, sequelize } = require("../models");
const {
  createRecipient,
  initiateTransfer,
} = require("./paystackTransfer");

exports.processWithdrawal = async (withdrawalId) => {
  const tx = await sequelize.transaction();

  try {
    const withdrawal = await Withdrawal.findByPk(withdrawalId, {
      transaction: tx,
      lock: tx.LOCK.UPDATE,
    });

    if (!withdrawal || withdrawal.status !== "pending") {
      throw new Error("Invalid withdrawal");
    }

    const recipient = await createRecipient(
      withdrawal.accountNumber,
      withdrawal.bankCode
    );

    const transfer = await initiateTransfer({
      amount: Number(withdrawal.amount) * 100,
      recipient: recipient.recipient_code,
      reference: withdrawal.reference || `WD_${withdrawal.id}`,
    });

    await withdrawal.update(
      {
        status: "success",
      },
      { transaction: tx }
    );

    await tx.commit();
    return transfer;
  } catch (err) {
    await tx.rollback();
    throw err;
  }
};
