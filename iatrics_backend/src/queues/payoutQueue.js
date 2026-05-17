let payoutQueue = null;

if (process.env.REDIS_URL) {
  const { Queue } = require("bullmq");
  const IORedis = require("ioredis");

  const connection = new IORedis(process.env.REDIS_URL);
  payoutQueue = new Queue("payoutQueue", { connection });
}

module.exports = payoutQueue;
