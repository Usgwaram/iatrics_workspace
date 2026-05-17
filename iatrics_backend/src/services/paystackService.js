const axios = require("axios");
const { Provider } = require("../models");
const { paystackSecret } = require("../config/secrets");

const PAYSTACK_BASE = "https://api.paystack.co";

async function createProviderSubaccount(providerId) {
  const provider = await Provider.findByPk(providerId);

  if (!provider) throw new Error("Provider not found");

  // 🚨 prevent duplicates
  if (provider.paystack_subaccount_code) {
    return provider.paystack_subaccount_code;
  }

  const response = await axios.post(
    `${PAYSTACK_BASE}/subaccount`,
    {
      business_name: provider.name,
      settlement_bank: provider.bank_code,
      account_number: provider.account_number,
      percentage_charge: 20, // platform takes 20%
    },
    {
      headers: {
        Authorization: `Bearer ${paystackSecret()}`,
        "Content-Type": "application/json",
      },
    }
  );

  const subaccountCode = response.data.data.subaccount_code;

  provider.paystack_subaccount_code = subaccountCode;
  await provider.save();

  console.log("✅ Subaccount created:", subaccountCode);

  return subaccountCode;
}

module.exports = {
  createProviderSubaccount,
};
