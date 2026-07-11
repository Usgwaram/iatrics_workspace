const h = require("./templateHelpers");

module.exports = {
  required: ["providerName", "amount", "currency", "bankName", "maskedAccountNumber", "withdrawalReference", "processedAt", "walletUrl"],
  sender: "payments",
  render(data) {
    return {
      subject: "Your Iatrics withdrawal has been processed",
      previewText: "Your withdrawal has been processed.",
      html: [
        h.heading("Withdrawal processed"),
        h.paragraph(`Hello ${data.providerName}, your Iatrics withdrawal has been processed.`),
        h.receiptTable([
          { label: "Amount", value: h.formatMoney(data.amount, data.currency) },
          { label: "Bank", value: data.bankName },
          { label: "Account", value: data.maskedAccountNumber },
          { label: "Reference", value: data.withdrawalReference },
          { label: "Processed", value: data.processedAt },
        ]),
        h.button({ label: "View wallet", url: data.walletUrl }),
        h.linkFallback(data.walletUrl),
      ].join(""),
      text: h.textBlock([
        `Hello ${data.providerName}, your withdrawal has been processed.`,
        `Amount: ${h.formatMoney(data.amount, data.currency)}`,
        `Account: ${data.maskedAccountNumber}`,
        `Reference: ${data.withdrawalReference}`,
        data.walletUrl,
      ]),
    };
  },
};
