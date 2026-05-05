const { Queue } = require("bullmq");

const IORedis = require("ioredis");

const connection = process.env.REDIS_URL
  ? new IORedis(process.env.REDIS_URL)
  : new IORedis({
      host: "127.0.0.1",
      port: 6379,
    });

module.exports = payoutQueue;