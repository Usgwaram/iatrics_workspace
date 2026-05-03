const { Withdrawal, WalletTransaction, sequelize } = require("../models");
const {
  createRecipient,
  initiateTransfer,
} = require("./paystackTransfer");

exports.processWithdrawal = async (withdrawalId) => {
  const t = await sequelize.transaction();

  try {
    const withdrawal = await Withdrawal.findByPk(withdrawalId, {
      transaction: t,
    });

    if (!withdrawal || withdrawal.status !== "pending") {
      throw new Error("Invalid withdrawal");
    }

    // 🔐 Step 1: Create recipient
    const recipient = await createRecipient(
      withdrawal.accountNumber,
      withdrawal.bankCode
    );

    // 💸 Step 2: Initiate transfer
    const transfer = await initiateTransfer({
      amount: withdrawal.amount * 100,
      recipient: recipient.recipient_code,
      reference: withdrawal.reference,
    });

    // ✅ Step 3: Mark success
    await withdrawal.update(
      {
        status: "processing",
        transferCode: transfer.transfer_code,
      },
      { transaction: t }
    );

    await WalletTransaction.update(
      { status: "success" },
      {
        where: { reference: withdrawal.reference },
        transaction: t,
      }
    );

    await t.commit();

    return transfer;

  } catch (err) {
    await t.rollback();
    console.error("❌ Payout failed:", err);

    // 🔁 REFUND (VERY IMPORTANT)
    await WalletTransaction.create({
      userId: withdrawal.userId,
      type: "credit",
      amount: withdrawal.amount,
      status: "success",
      reference: `REFUND_${withdrawal.reference}`,
      source: "refund",
    });

    await withdrawal.update({ status: "failed" });

    throw err;
  }
};