const EMAIL_TYPES = Object.freeze({
  ACCOUNT_VERIFICATION: "ACCOUNT_VERIFICATION",
  PASSWORD_RESET: "PASSWORD_RESET",
  WELCOME_USER: "WELCOME_USER",
  WELCOME_PROVIDER: "WELCOME_PROVIDER",
  APPOINTMENT_CONFIRMATION: "APPOINTMENT_CONFIRMATION",
  CONSULTATION_REMINDER: "CONSULTATION_REMINDER",
  CONSULTATION_COMPLETED: "CONSULTATION_COMPLETED",
  PROVIDER_APPROVED: "PROVIDER_APPROVED",
  PROVIDER_DOCUMENTS_REQUIRED: "PROVIDER_DOCUMENTS_REQUIRED",
  WALLET_TOP_UP_SUCCESSFUL: "WALLET_TOP_UP_SUCCESSFUL",
  PAYMENT_RECEIPT: "PAYMENT_RECEIPT",
  PRESCRIPTION_READY: "PRESCRIPTION_READY",
  LABORATORY_REQUEST: "LABORATORY_REQUEST",
  NEW_SECURE_MESSAGE: "NEW_SECURE_MESSAGE",
  REFERRAL_REWARD: "REFERRAL_REWARD",
  WITHDRAWAL_SUCCESSFUL: "WITHDRAWAL_SUCCESSFUL",
  BETA_INVITATION_USER: "BETA_INVITATION_USER",
  BETA_INVITATION_PROVIDER: "BETA_INVITATION_PROVIDER",
});

const SENDER_CATEGORIES = Object.freeze({
  accounts: { name: "Iatrics Accounts", address: "accounts@iatrics.ng" },
  appointments: { name: "Iatrics Appointments", address: "appointments@iatrics.ng" },
  payments: { name: "Iatrics Payments", address: "payments@iatrics.ng" },
  providers: { name: "Iatrics Providers", address: "providers@iatrics.ng" },
  support: { name: "Iatrics Support", address: "support@iatrics.ng" },
  notifications: { name: "Iatrics Notifications", address: "notifications@iatrics.ng" },
});

module.exports = {
  EMAIL_TYPES,
  SENDER_CATEGORIES,
};
