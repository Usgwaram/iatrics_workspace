const { maskSensitiveData } = require("../../utils/maskSensitiveData");

function createConsoleProvider({ logger = console } = {}) {
  return {
    name: "console",

    async send(message) {
      if (process.env.EMAIL_CONSOLE_FAIL === "true") {
        throw new Error("Console email provider forced failure");
      }

      const safePayload = maskSensitiveData({
        to: message.to,
        from: message.from,
        replyTo: message.replyTo,
        subject: message.subject,
        type: message.type,
        metadata: message.metadata,
        idempotencyKey: message.idempotencyKey,
      });

      logger.info("[EMAIL:console]", safePayload);

      return {
        messageId: `console_${Date.now()}`,
      };
    },
  };
}

module.exports = createConsoleProvider;
