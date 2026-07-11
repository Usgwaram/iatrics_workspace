const h = require("./templateHelpers");

module.exports = {
  required: ["firstName", "providerName", "consultationReference", "laboratoryRequestUrl"],
  sender: "notifications",
  healthDisclaimer: true,
  render(data) {
    return {
      subject: "A laboratory request is available in your Iatrics account",
      previewText: "A secure laboratory request is available in your account.",
      html: [
        h.heading("Laboratory request available"),
        h.paragraph(`Hello ${data.firstName}, a laboratory request from ${data.providerName} is available in your Iatrics account.`),
        h.infoCard([{ label: "Consultation reference", value: data.consultationReference }]),
        h.button({ label: "View in Iatrics", url: data.laboratoryRequestUrl }),
        h.linkFallback(data.laboratoryRequestUrl),
      ].join(""),
      text: h.textBlock([
        `Hello ${data.firstName}, a laboratory request is available in your Iatrics account.`,
        `Reference: ${data.consultationReference}`,
        data.laboratoryRequestUrl,
      ]),
    };
  },
};
