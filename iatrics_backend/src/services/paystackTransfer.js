const axios = require("axios");
const { paystackSecret } = require("../config/secrets");

const PAYSTACK = "https://api.paystack.co";

function headers() {
  return {
    Authorization: `Bearer ${paystackSecret()}`,
  };
}

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
    { headers: headers() }
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
    { headers: headers() }
  );

  return res.data.data;
};
