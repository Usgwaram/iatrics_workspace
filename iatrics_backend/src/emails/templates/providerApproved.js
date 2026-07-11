const h = require("./templateHelpers");

module.exports = {
  required: ["providerName", "dashboardUrl", "profileUrl"],
  sender: "providers",
  render(data) {
    return {
      subject: "Your Iatrics provider account has been approved",
      previewText: "Your provider account is approved and ready for setup.",
      html: [
        h.heading("Provider account approved"),
        h.paragraph(`Hello ${data.providerName}, your Iatrics provider account has been approved.`),
        h.list(["Review your profile", "Set your availability", "Confirm consultation pricing", "Verify payout details"]),
        h.button({ label: "Open dashboard", url: data.dashboardUrl }),
        h.linkFallback(data.profileUrl),
      ].join(""),
      text: h.textBlock([
        `Hello ${data.providerName}, your Iatrics provider account has been approved.`,
        "Next steps: review your profile, set availability, confirm pricing, and verify payout details.",
        data.dashboardUrl,
      ]),
    };
  },
};
