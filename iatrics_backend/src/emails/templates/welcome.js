const h = require("./templateHelpers");

function renderWelcome(data, provider = false) {
  const url = data.dashboardUrl || data.appUrl || data.loginUrl || "https://iatrics.ng";
  const title = provider ? "Welcome to the Iatrics Provider Network" : "Welcome to Iatrics";
  return {
    subject: title,
    previewText: provider
      ? "Your provider profile is ready for the next onboarding steps."
      : "Your Iatrics account is ready.",
    html: [
      h.heading(title),
      h.paragraph(`Hello ${data.firstName || data.providerName || "there"},`),
      h.paragraph(provider
        ? "Thank you for joining Iatrics as a provider. You can continue onboarding, review your profile, and prepare your availability."
        : "Thank you for joining Iatrics. You can now manage consultations and healthcare activity securely in your account."),
      h.button({ label: provider ? "Open provider dashboard" : "Open Iatrics", url }),
      h.linkFallback(url),
    ].join(""),
    text: h.textBlock([
      `Hello ${data.firstName || data.providerName || "there"},`,
      provider
        ? "Thank you for joining Iatrics as a provider."
        : "Thank you for joining Iatrics.",
      url,
    ]),
  };
}

module.exports = {
  user: {
    required: ["firstName"],
    sender: "accounts",
    render: (data) => renderWelcome(data, false),
  },
  provider: {
    required: ["providerName"],
    sender: "providers",
    render: (data) => renderWelcome(data, true),
  },
};
