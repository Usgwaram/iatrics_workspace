const h = require("./templateHelpers");

module.exports = {
  required: ["providerName", "requiredDocuments", "uploadUrl", "supportEmail"],
  sender: "providers",
  render(data) {
    return {
      subject: "Action required for your Iatrics provider application",
      previewText: "Additional documents are required for your provider application.",
      html: [
        h.heading("Documents required"),
        h.paragraph(`Hello ${data.providerName}, we need a few more details to continue reviewing your provider application.`),
        h.list(Array.isArray(data.requiredDocuments) ? data.requiredDocuments : [data.requiredDocuments]),
        h.button({ label: "Upload documents", url: data.uploadUrl }),
        h.paragraph(`For help, contact ${data.supportEmail}.`),
        h.linkFallback(data.uploadUrl),
      ].join(""),
      text: h.textBlock([
        `Hello ${data.providerName}, additional documents are required:`,
        (Array.isArray(data.requiredDocuments) ? data.requiredDocuments : [data.requiredDocuments]).join(", "),
        data.uploadUrl,
        `Support: ${data.supportEmail}`,
      ]),
    };
  },
};
