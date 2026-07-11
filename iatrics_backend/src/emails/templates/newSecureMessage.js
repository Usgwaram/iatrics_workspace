const h = require("./templateHelpers");

module.exports = {
  required: ["firstName", "senderDisplayName", "conversationUrl"],
  sender: "notifications",
  healthDisclaimer: true,
  render(data) {
    return {
      subject: "You have a new secure message in Iatrics",
      previewText: "Open Iatrics to read your secure message.",
      html: [
        h.heading("New secure message"),
        h.paragraph(`Hello ${data.firstName}, you have a new secure message from ${data.senderDisplayName}.`),
        h.paragraph("For privacy, message contents are available only after signing in to Iatrics."),
        h.button({ label: "Open message", url: data.conversationUrl }),
        h.linkFallback(data.conversationUrl),
      ].join(""),
      text: h.textBlock([
        `Hello ${data.firstName}, you have a new secure message from ${data.senderDisplayName}.`,
        "For privacy, sign in to Iatrics to read it.",
        data.conversationUrl,
      ]),
    };
  },
};
