const { Queue } = require("bullmq");
const IORedis = require("ioredis");

const connection = new IORedis();

const payoutQueue = new Queue("payoutQueue", { connection });

module.exports = payoutQueue;