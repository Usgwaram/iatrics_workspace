const { Wallet } = require("../models");

async function creditProvider(providerId, amount) {
  let wallet = await Wallet.findOne({ where: { providerId } });

  if (!wallet) {
    wallet = await Wallet.create({ providerId, balance: 0 });
  }

  wallet.balance += amount;
  await wallet.save();

  console.log(`💳 Provider ${providerId} credited: ${amount}`);
}

module.exports = { creditProvider };