const { EmailProviderError } = require("./email.errors");

function createSmtpProvider({ smtp, nodemailerClient } = {}) {
  if (!smtp?.host || !smtp?.user || !smtp?.pass) {
    throw new EmailProviderError("SMTP credentials are not configured", {
      provider: "smtp",
    });
  }

  const nodemailer = nodemailerClient || require("nodemailer");
  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: {
      user: smtp.user,
      pass: smtp.pass,
    },
  });

  return {
    name: "smtp",

    async send(message) {
      try {
        const response = await transporter.sendMail({
          from: message.from,
          to: message.to,
          replyTo: message.replyTo,
          subject: message.subject,
          html: message.html,
          text: message.text,
          headers: message.idempotencyKey
            ? { "Idempotency-Key": message.idempotencyKey }
            : undefined,
        });

        return {
          messageId: response.messageId,
        };
      } catch (err) {
        throw new EmailProviderError("Email provider send failed", {
          provider: "smtp",
          reason: err.message,
        });
      }
    },
  };
}

module.exports = createSmtpProvider;
