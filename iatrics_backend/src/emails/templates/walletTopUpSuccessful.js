const h = require("./templateHelpers");

module.exports = {
  required: ["firstName", "amount", "currency", "transactionReference", "paymentMethod", "transactionDate", "walletBalance", "walletUrl"],
  sender: "payments",
  render(data) {
    return {
      subject: "Your Iatrics wallet has been funded",
      previewText: "Your wallet top-up has been completed.",
      html: [
        h.heading("Wallet funded"),
        h.paragraph(`Hello ${data.firstName}, your wallet top-up was successful.`),
        h.receiptTable([
          { label: "Amount", value: h.formatMoney(data.amount, data.currency) },
          { label: "Wallet balance", value: h.formatMoney(data.walletBalance, data.currency) },
          { label: "Payment method", value: data.paymentMethod },
          { label: "Reference", value: data.transactionReference },
          { label: "Date", value: data.transactionDate },
        ]),
        h.button({ label: "View wallet", url: data.walletUrl }),
        h.linkFallback(data.walletUrl),
      ].join(""),
      text: h.textBlock([
        `Hello ${data.firstName}, your wallet top-up was successful.`,
        `Amount: ${h.formatMoney(data.amount, data.currency)}`,
        `Balance: ${h.formatMoney(data.walletBalance, data.currency)}`,
        `Reference: ${data.transactionReference}`,
        data.walletUrl,
      ]),
    };
  },
};
