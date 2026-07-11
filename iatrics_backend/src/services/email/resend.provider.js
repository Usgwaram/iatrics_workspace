const { EmailProviderError } = require("./email.errors");

function createResendProvider({ apiKey, ResendClient } = {}) {
  if (!apiKey) {
    throw new EmailProviderError("Resend API key is not configured", {
      provider: "resend",
    });
  }

  const Resend = ResendClient || require("resend").Resend;
  const client = new Resend(apiKey);

  return {
    name: "resend",

    async send(message) {
      try {
        const response = await client.emails.send({
          from: message.from,
          to: message.to,
          reply_to: message.replyTo,
          subject: message.subject,
          html: message.html,
          text: message.text,
          headers: message.idempotencyKey
            ? { "Idempotency-Key": message.idempotencyKey }
            : undefined,
        });

        if (response.error) {
          throw new Error(response.error.message || "Resend send failed");
        }

        return {
          messageId: response.data?.id,
        };
      } catch (err) {
        throw new EmailProviderError("Email provider send failed", {
          provider: "resend",
          reason: err.message,
        });
      }
    },
  };
}

module.exports = createResendProvider;
