const axios = require("axios");

const PAYSTACK = "https://api.paystack.co";
const headers = {
  Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
};

exports.createRecipient = async (accountNumber, bankCode) => {
  const res = await axios.post(
    `${PAYSTACK}/transferrecipient`,
    {
      type: "nuban",
      name: "Iatrics User",
      account_number: accountNumber,
      bank_code: bankCode,
      currency: "NGN",
    },
    { headers }
  );

  return res.data.data;
};

exports.initiateTransfer = async ({ amount, recipient, reference }) => {
  const res = await axios.post(
    `${PAYSTACK}/transfer`,
    {
      source: "balance",
      amount,
      recipient,
      reference,
    },
    { headers }
  );

  return res.data.data;
};