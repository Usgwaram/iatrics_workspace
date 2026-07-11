const h = require("./templateHelpers");

module.exports = {
  required: ["firstName", "providerName", "consultationReference", "reviewUrl", "summaryUrl"],
  sender: "appointments",
  healthDisclaimer: true,
  render(data) {
    return {
      subject: "Your Iatrics consultation has been completed",
      previewText: "Your consultation summary is available in Iatrics.",
      html: [
        h.heading("Consultation completed"),
        h.paragraph(`Hello ${data.firstName}, your consultation with ${data.providerName} has been completed.`),
        h.infoCard([{ label: "Reference", value: data.consultationReference }]),
        h.button({ label: "Rate your experience", url: data.reviewUrl }),
        h.linkFallback(data.summaryUrl),
      ].join(""),
      text: h.textBlock([
        `Hello ${data.firstName}, your consultation with ${data.providerName} has been completed.`,
        `Reference: ${data.consultationReference}`,
        `Review: ${data.reviewUrl}`,
        `Summary: ${data.summaryUrl}`,
      ]),
    };
  },
};
