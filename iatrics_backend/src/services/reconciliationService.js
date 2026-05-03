const { WalletTransaction, Withdrawal } = require("../models");

exports.reconcile = async () => {
  console.log("🧾 Running reconciliation...");

  const withdrawals = await Withdrawal.findAll({
    where: { status: "processing" },
  });

  for (const w of withdrawals) {
    const tx = await WalletTransaction.findOne({
      where: { reference: w.reference },
    });

    if (!tx) continue;

    if (tx.status === "success") {
      await w.update({ status: "success" });
    }

    if (tx.status === "failed") {
      await w.update({ status: "failed" });
    }
  }

  console.log("✅ Reconciliation complete");
};