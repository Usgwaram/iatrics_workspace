const h = require("./templateHelpers");

function renderBeta(data) {
  return {
    subject: "You're invited to test Iatrics",
    previewText: "You have been invited to participate in Iatrics beta testing.",
    html: [
      h.heading("You're invited to test Iatrics"),
      h.paragraph(`Hello ${data.recipientName}, you are invited to test the Iatrics ${data.testerType} experience on ${data.platform}.`),
      h.paragraph("Beta access may include unfinished features. Please keep test details confidential and share feedback through the official feedback link."),
      h.button({ label: "Download beta app", url: data.downloadUrl }),
      h.linkFallback(data.feedbackUrl),
      h.paragraph(`For help, contact ${data.supportEmail}.`),
    ].join(""),
    text: h.textBlock([
      `Hello ${data.recipientName}, you are invited to test Iatrics on ${data.platform}.`,
      "Please keep beta details confidential and share feedback through the official link.",
      `Download: ${data.downloadUrl}`,
      `Feedback: ${data.feedbackUrl}`,
      `Support: ${data.supportEmail}`,
    ]),
  };
}

const betaTemplate = {
  required: ["recipientName", "testerType", "platform", "downloadUrl", "feedbackUrl", "supportEmail"],
  sender: "notifications",
  render: renderBeta,
};

module.exports = {
  user: betaTemplate,
  provider: betaTemplate,
};
