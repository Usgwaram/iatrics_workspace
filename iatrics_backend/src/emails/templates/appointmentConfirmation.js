const h = require("./templateHelpers");

module.exports = {
  required: ["firstName", "providerName", "specialty", "consultationDate", "consultationTime", "timezone", "consultationMode", "consultationReference", "openConsultationUrl"],
  sender: "appointments",
  healthDisclaimer: true,
  render(data) {
    return {
      subject: "Your Iatrics consultation is confirmed",
      previewText: "Your consultation booking details are available.",
      html: [
        h.heading("Consultation confirmed"),
        h.paragraph(`Hello ${data.firstName}, your Iatrics consultation has been confirmed.`),
        h.infoCard([
          { label: "Provider", value: data.providerName },
          { label: "Specialty", value: data.specialty },
          { label: "Date", value: data.consultationDate },
          { label: "Time", value: `${data.consultationTime} ${data.timezone}` },
          { label: "Mode", value: data.consultationMode },
          { label: "Reference", value: data.consultationReference },
        ]),
        h.button({ label: "Open consultation", url: data.openConsultationUrl }),
        h.linkFallback(data.openConsultationUrl),
      ].join(""),
      text: h.textBlock([
        `Hello ${data.firstName}, your Iatrics consultation is confirmed.`,
        `Provider: ${data.providerName}`,
        `Specialty: ${data.specialty}`,
        `Date: ${data.consultationDate}`,
        `Time: ${data.consultationTime} ${data.timezone}`,
        `Reference: ${data.consultationReference}`,
        data.openConsultationUrl,
      ]),
    };
  },
};
