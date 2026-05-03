const { Worker } = require("bullmq");
const IORedis = require("ioredis");
const { processWithdrawal } = require("../services/payoutService");

const connection = new IORedis();

const worker = new Worker(
  "payoutQueue",
  async job => {
    const { withdrawalId } = job.data;

    console.log("🚀 Processing payout:", withdrawalId);

    await processWithdrawal(withdrawalId);
  },
  {
    connection,
    attempts: 3, // 🔁 retry 3 times
    backoff: {
      type: "exponential",
      delay: 5000, // 5s, 10s, 20s
    },
  }
);

worker.on("completed", job => {
  console.log("✅ Payout success:", job.id);
});

worker.on("failed", (job, err) => {
  console.error("❌ Payout failed:", job.id, err.message);
});