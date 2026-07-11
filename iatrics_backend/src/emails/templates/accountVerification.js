const h = require("./templateHelpers");

module.exports = {
  required: ["firstName", "verificationUrl", "expiresInMinutes"],
  sender: "accounts",
  healthDisclaimer: false,
  render(data) {
    return {
      subject: "Verify your Iatrics account",
      previewText: "Complete your Iatrics account setup securely.",
      html: [
        h.heading("Verify your account"),
        h.paragraph(`Hello ${data.firstName}, welcome to Iatrics.`),
        h.paragraph(`Please verify your account. This secure link expires in ${data.expiresInMinutes} minutes.`),
        h.button({ label: "Verify account", url: data.verificationUrl }),
        h.linkFallback(data.verificationUrl),
      ].join(""),
      text: h.textBlock([
        `Hello ${data.firstName},`,
        `Please verify your Iatrics account. This link expires in ${data.expiresInMinutes} minutes.`,
        data.verificationUrl,
      ]),
    };
  },
};
