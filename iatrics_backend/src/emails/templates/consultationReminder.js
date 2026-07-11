const h = require("./templateHelpers");

module.exports = {
  required: ["firstName", "providerName", "consultationDate", "consultationTime", "timezone", "minutesUntilConsultation", "joinUrl"],
  sender: "appointments",
  healthDisclaimer: true,
  render(data) {
    return {
      subject: "Reminder: Your Iatrics consultation is coming up",
      previewText: "Your upcoming Iatrics consultation starts soon.",
      html: [
        h.heading("Your consultation starts soon"),
        h.paragraph(`Hello ${data.firstName}, this is a reminder that your consultation with ${data.providerName} is coming up in ${data.minutesUntilConsultation} minutes.`),
        h.infoCard([
          { label: "Date", value: data.consultationDate },
          { label: "Time", value: `${data.consultationTime} ${data.timezone}` },
        ]),
        h.paragraph("Please join from a quiet place with a stable internet connection and keep any relevant health information ready in the app."),
        h.button({ label: "Join consultation", url: data.joinUrl }),
        h.linkFallback(data.joinUrl),
      ].join(""),
      text: h.textBlock([
        `Hello ${data.firstName}, your consultation with ${data.providerName} starts in ${data.minutesUntilConsultation} minutes.`,
        `${data.consultationDate} at ${data.consultationTime} ${data.timezone}`,
        data.joinUrl,
      ]),
    };
  },
};
