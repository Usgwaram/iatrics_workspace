const h = require("./templateHelpers");

module.exports = {
  required: ["firstName", "providerName", "consultationReference", "prescriptionUrl"],
  sender: "notifications",
  healthDisclaimer: true,
  render(data) {
    return {
      subject: "A prescription is available in your Iatrics account",
      previewText: "A secure health document is available in your account.",
      html: [
        h.heading("Prescription available"),
        h.paragraph(`Hello ${data.firstName}, a prescription from ${data.providerName} is available in your Iatrics account.`),
        h.infoCard([{ label: "Consultation reference", value: data.consultationReference }]),
        h.button({ label: "View in Iatrics", url: data.prescriptionUrl }),
        h.linkFallback(data.prescriptionUrl),
      ].join(""),
      text: h.textBlock([
        `Hello ${data.firstName}, a prescription is available in your Iatrics account.`,
        `Reference: ${data.consultationReference}`,
        data.prescriptionUrl,
      ]),
    };
  },
};
