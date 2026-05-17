const {
  WalletTransaction,
  Withdrawal,
  sequelize,
} = require("../models");

const { calculateBalance } = require("./walletController");

// ============================
// REQUEST WITHDRAWAL
// ============================

exports.requestWithdrawal = async (req, res) => {
  const tx =
    global.testTransaction ||
    (await sequelize.transaction());

  const usingGlobalTx =
    !!global.testTransaction;

  try {
    const {
      amount,
      bankCode,
      accountNumber,
      accountName,
    } = req.body;

    const userId =
      req.user?.id || req.body.userId;

    // ============================
    // VALIDATION
    // ============================

    const transferAmount = Number(amount);

    if (
      !Number.isFinite(transferAmount) ||
      transferAmount <= 0 ||
      !bankCode ||
      !accountNumber
    ) {
      throw new Error(
        "All fields are required"
      );
    }

    // ============================
    // BALANCE CHECK
    // ============================

    const balance =
      await calculateBalance(userId, tx);

    if (balance < transferAmount) {
      throw new Error(
        "Insufficient funds"
      );
    }

    // ============================
    // CREATE WITHDRAWAL
    // ============================

    const withdrawal =
      await Withdrawal.create(
        {
          userId,
          amount: transferAmount,
          bankCode,
          accountNumber,
          status: "pending",
        },
        {
          transaction: tx,
        }
      );

    // ============================
    // WALLET DEBIT
    // ============================

    const reference = `WD_${Date.now()}_${userId}`;

    await WalletTransaction.create(
      {
        userId,
        amount: transferAmount,
        type: "debit",
        status: "confirmed",
        reference,
        source: "bank_transfer",
      },
      {
        transaction: tx,
      }
    );

    // ============================
    // COMMIT
    // ============================

    if (!usingGlobalTx) {
      await tx.commit();
    }

    return res.json({
      success: true,
      withdrawal,
      reference,
      balance: balance - transferAmount,
    });

  } catch (err) {

    if (!usingGlobalTx) {
      await tx.rollback();
    }

    console.error(
      "❌ Withdrawal error:",
      err
    );

    return res.status(500).json({
      error: err.message,
    });
  }
};

// ============================
// GET LOGGED-IN USER WITHDRAWALS
// ============================

exports.getMyWithdrawals =
  async (req, res) => {

  try {
    const withdrawals =
      await Withdrawal.findAll({
        where: {
          userId: req.user.id,
        },
        order: [
          ["createdAt", "DESC"],
        ],
        transaction: global.testTransaction || undefined,
      });

    return res.json({ withdrawals });

  } catch (err) {

    console.error(
      "❌ Fetch withdrawals error:",
      err
    );

    return res.status(500).json({
      error:
        "Failed to fetch withdrawals",
    });
  }
};

// ============================
// GET PROVIDER WITHDRAWALS
// ============================

exports.getProviderWithdrawals =
  async (req, res) => {

  try {

    const { providerId } =
      req.params;

    const withdrawals =
      await Withdrawal.findAll({
        where: {
          userId: providerId,
        },
        order: [
          ["createdAt", "DESC"],
        ],
      });

    return res.json(withdrawals);

  } catch (err) {

    console.error(
      "❌ Fetch withdrawals error:",
      err
    );

    return res.status(500).json({
      error:
        "Failed to fetch withdrawals",
    });
  }
};
