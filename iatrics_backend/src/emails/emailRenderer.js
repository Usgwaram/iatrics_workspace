const layout = require("./components/layout");
const { emailConfig } = require("../config/email.config");
const { EMAIL_TYPES } = require("../services/email/email.types");
const { EmailValidationError } = require("../services/email/email.errors");

const templates = {
  [EMAIL_TYPES.ACCOUNT_VERIFICATION]: require("./templates/accountVerification"),
  [EMAIL_TYPES.PASSWORD_RESET]: require("./templates/passwordReset"),
  [EMAIL_TYPES.WELCOME_USER]: require("./templates/welcome").user,
  [EMAIL_TYPES.WELCOME_PROVIDER]: require("./templates/welcome").provider,
  [EMAIL_TYPES.APPOINTMENT_CONFIRMATION]: require("./templates/appointmentConfirmation"),
  [EMAIL_TYPES.CONSULTATION_REMINDER]: require("./templates/consultationReminder"),
  [EMAIL_TYPES.CONSULTATION_COMPLETED]: require("./templates/consultationCompleted"),
  [EMAIL_TYPES.PROVIDER_APPROVED]: require("./templates/providerApproved"),
  [EMAIL_TYPES.PROVIDER_DOCUMENTS_REQUIRED]: require("./templates/providerDocumentsRequired"),
  [EMAIL_TYPES.WALLET_TOP_UP_SUCCESSFUL]: require("./templates/walletTopUpSuccessful"),
  [EMAIL_TYPES.PAYMENT_RECEIPT]: require("./templates/paymentReceipt"),
  [EMAIL_TYPES.PRESCRIPTION_READY]: require("./templates/prescriptionReady"),
  [EMAIL_TYPES.LABORATORY_REQUEST]: require("./templates/laboratoryRequest"),
  [EMAIL_TYPES.NEW_SECURE_MESSAGE]: require("./templates/newSecureMessage"),
  [EMAIL_TYPES.REFERRAL_REWARD]: require("./templates/referralReward"),
  [EMAIL_TYPES.WITHDRAWAL_SUCCESSFUL]: require("./templates/withdrawalSuccessful"),
  [EMAIL_TYPES.BETA_INVITATION_USER]: require("./templates/betaInvitation").user,
  [EMAIL_TYPES.BETA_INVITATION_PROVIDER]: require("./templates/betaInvitation").provider,
};

function validateRequired(template, data, type) {
  const missing = (template.required || []).filter((key) => {
    const value = data[key];
    return value === undefined || value === null || value === "";
  });

  if (missing.length) {
    throw new EmailValidationError("Missing required email template data", {
      type,
      missing,
    });
  }
}

function renderEmail(type, data = {}, options = {}) {
  const template = templates[type];

  if (!template) {
    throw new EmailValidationError("Unknown email type", { type });
  }

  validateRequired(template, data, type);

  const config = {
    ...emailConfig().defaults,
    ...(options.config || {}),
  };

  const rendered = template.render(data, config);

  return {
    ...rendered,
    html: layout({
      title: rendered.subject,
      previewText: rendered.previewText,
      content: rendered.html,
      config,
      healthDisclaimer: template.healthDisclaimer,
    }),
    sender: template.sender,
    required: template.required,
  };
}

module.exports = {
  renderEmail,
  templates,
};
