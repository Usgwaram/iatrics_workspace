const h = require("./templateHelpers");

module.exports = {
  required: ["firstName", "transactionReference", "consultationReference", "providerName", "serviceDescription", "amount", "platformFee", "total", "currency", "paymentDate", "receiptUrl"],
  sender: "payments",
  render(data) {
    return {
      subject: "Your Iatrics payment receipt",
      previewText: "Your Iatrics payment receipt is ready.",
      html: [
        h.heading("Payment receipt"),
        h.paragraph(`Hello ${data.firstName}, your payment has been processed.`),
        h.infoCard([
          { label: "Provider", value: data.providerName },
          { label: "Service", value: data.serviceDescription },
          { label: "Consultation reference", value: data.consultationReference },
          { label: "Transaction reference", value: data.transactionReference },
        ]),
        h.receiptTable([
          { label: "Amount", value: h.formatMoney(data.amount, data.currency) },
          { label: "Platform fee", value: h.formatMoney(data.platformFee, data.currency) },
          { label: "Total", value: h.formatMoney(data.total, data.currency) },
          { label: "Date", value: data.paymentDate },
        ]),
        h.button({ label: "View receipt", url: data.receiptUrl }),
        h.linkFallback(data.receiptUrl),
      ].join(""),
      text: h.textBlock([
        `Hello ${data.firstName}, your payment has been processed.`,
        `Reference: ${data.transactionReference}`,
        `Total: ${h.formatMoney(data.total, data.currency)}`,
        data.receiptUrl,
      ]),
    };
  },
};
