const { emailConfig } = require("../../config/email.config");
const createConsoleProvider = require("./console.provider");
const createResendProvider = require("./resend.provider");
const createSmtpProvider = require("./smtp.provider");

function createEmailProvider(config = emailConfig(), options = {}) {
  if (options.provider) return options.provider;

  if (config.provider === "resend") {
    return createResendProvider({
      apiKey: config.resend.apiKey,
      ResendClient: options.ResendClient,
    });
  }

  if (config.provider === "smtp") {
    return createSmtpProvider({
      smtp: config.smtp,
      nodemailerClient: options.nodemailerClient,
    });
  }

  return createConsoleProvider({
    logger: options.logger,
  });
}

module.exports = {
  createEmailProvider,
};
