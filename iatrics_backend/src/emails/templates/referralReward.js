const h = require("./templateHelpers");

module.exports = {
  required: ["firstName", "rewardAmount", "currency", "walletBalance", "referralReference", "walletUrl"],
  sender: "payments",
  render(data) {
    return {
      subject: "You earned an Iatrics referral reward",
      previewText: "A referral reward has been added to your wallet.",
      html: [
        h.heading("Referral reward added"),
        h.paragraph(`Hello ${data.firstName}, a referral reward has been added to your Iatrics wallet.`),
        h.receiptTable([
          { label: "Reward", value: h.formatMoney(data.rewardAmount, data.currency) },
          { label: "Wallet balance", value: h.formatMoney(data.walletBalance, data.currency) },
          { label: "Reference", value: data.referralReference },
        ]),
        h.paragraph("Referral rewards depend on eligible completed activity and are not a guarantee of income."),
        h.button({ label: "View wallet", url: data.walletUrl }),
      ].join(""),
      text: h.textBlock([
        `Hello ${data.firstName}, a referral reward was added to your wallet.`,
        `Reward: ${h.formatMoney(data.rewardAmount, data.currency)}`,
        `Reference: ${data.referralReference}`,
        data.walletUrl,
      ]),
    };
  },
};
