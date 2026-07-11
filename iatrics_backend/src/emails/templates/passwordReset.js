const h = require("./templateHelpers");

module.exports = {
  required: ["firstName", "resetUrl", "expiresInMinutes"],
  sender: "accounts",
  healthDisclaimer: false,
  render(data) {
    return {
      subject: "Reset your Iatrics password",
      previewText: "Use this secure link to reset your Iatrics password.",
      html: [
        h.heading("Reset your password"),
        h.paragraph(`Hello ${data.firstName}, we received a request to reset your Iatrics password.`),
        h.paragraph(`This secure link expires in ${data.expiresInMinutes} minutes.`),
        h.button({ label: "Reset password", url: data.resetUrl }),
        h.alertBox("Iatrics Support will never ask for your password.", "warning"),
        h.linkFallback(data.resetUrl),
      ].join(""),
      text: h.textBlock([
        `Hello ${data.firstName},`,
        `Use this link to reset your Iatrics password. It expires in ${data.expiresInMinutes} minutes.`,
        data.resetUrl,
        "Iatrics Support will never ask for your password.",
      ]),
    };
  },
};
