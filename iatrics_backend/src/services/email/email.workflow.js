const { Provider, User } = require("../../models");
const { maskAccountNumber } = require("../../utils/maskSensitiveData");
const { emailConfig } = require("../../config/email.config");
const { EMAIL_TYPES } = require("./email.types");
const { sendSafely } = require("./email.service");

function firstName(fullName) {
  return String(fullName || "there").trim().split(/\s+/)[0] || "there";
}

function appUrl(path = "", audience = "user") {
  const config = emailConfig().defaults;
  const base = audience === "provider" ? config.providerAppUrl : config.userAppUrl;
  return `${String(base || config.appWebUrl).replace(/\/$/, "")}/${String(path).replace(/^\//, "")}`;
}

function displayDate(value) {
  if (!value) return "To be confirmed";
  return value;
}

async function sendAccountVerificationEmail(user, options = {}) {
  return sendSafely({
    type: EMAIL_TYPES.ACCOUNT_VERIFICATION,
    to: user.email,
    data: {
      firstName: firstName(user.fullName),
      verificationUrl: options.verificationUrl,
      expiresInMinutes: options.expiresInMinutes,
    },
    metadata: {
      entityType: "user",
      entityId: user.id,
      userId: user.id,
      idempotencyKey: `user:${user.id}:account-verification:${new Date(options.sentAt || Date.now()).getTime()}`,
    },
  });
}

async function sendPasswordResetEmail(user, options = {}) {
  return sendSafely({
    type: EMAIL_TYPES.PASSWORD_RESET,
    to: user.email,
    data: {
      firstName: firstName(user.fullName),
      resetUrl: options.resetUrl,
      expiresInMinutes: options.expiresInMinutes,
    },
    metadata: {
      entityType: "user",
      entityId: user.id,
      userId: user.id,
      idempotencyKey: `user:${user.id}:password-reset:${new Date(options.requestedAt || Date.now()).getTime()}`,
    },
  });
}

async function sendWelcomeEmail(user) {
  const provider = user.role === "PROVIDER";

  return sendSafely({
    type: provider ? EMAIL_TYPES.WELCOME_PROVIDER : EMAIL_TYPES.WELCOME_USER,
    to: user.email,
    data: provider
      ? {
          providerName: user.fullName,
          dashboardUrl: appUrl("provider/dashboard", "provider"),
          profileUrl: appUrl("provider/profile", "provider"),
        }
      : {
          firstName: firstName(user.fullName),
          appUrl: appUrl("home", "user"),
        },
    metadata: {
      entityType: "user",
      entityId: user.id,
      userId: user.id,
      idempotencyKey: `user:${user.id}:welcome`,
    },
  });
}

async function sendAppointmentConfirmation({ consultation, user, provider }) {
  const providerUser = provider.User || (provider.userId ? await User.findByPk(provider.userId) : null);

  await sendSafely({
    type: EMAIL_TYPES.APPOINTMENT_CONFIRMATION,
    to: user.email,
    data: {
      firstName: firstName(user.fullName),
      providerName: providerUser?.fullName || "your provider",
      specialty: provider.specialty || "Healthcare provider",
      consultationDate: displayDate(consultation.appointmentDate),
      consultationTime: consultation.appointmentTime || "To be confirmed",
      timezone: "Africa/Lagos",
      consultationMode: consultation.type || "video",
      consultationReference: consultation.channelName || String(consultation.id),
      openConsultationUrl: appUrl(`consultations/${consultation.id}`, "user"),
    },
    metadata: {
      entityType: "consultation",
      entityId: consultation.id,
      userId: user.id,
      consultationId: consultation.id,
      idempotencyKey: `consultation:${consultation.id}:patient-confirmation`,
    },
  });

  if (providerUser?.email) {
    await sendSafely({
      type: EMAIL_TYPES.APPOINTMENT_CONFIRMATION,
      to: providerUser.email,
      data: {
        firstName: firstName(providerUser.fullName),
        providerName: user.fullName || "Iatrics patient",
        specialty: provider.specialty || "Consultation",
        consultationDate: displayDate(consultation.appointmentDate),
        consultationTime: consultation.appointmentTime || "To be confirmed",
        timezone: "Africa/Lagos",
        consultationMode: consultation.type || "video",
        consultationReference: consultation.channelName || String(consultation.id),
        openConsultationUrl: appUrl(`provider/consultations/${consultation.id}`, "provider"),
      },
      metadata: {
        entityType: "consultation",
        entityId: consultation.id,
        userId: providerUser.id,
        consultationId: consultation.id,
        idempotencyKey: `consultation:${consultation.id}:provider-confirmation`,
      },
    });
  }
}

async function sendProviderApprovedEmail(provider) {
  const providerUser = provider.User || (provider.userId ? await User.findByPk(provider.userId) : null);
  if (!providerUser?.email) return null;

  return sendSafely({
    type: EMAIL_TYPES.PROVIDER_APPROVED,
    to: providerUser.email,
    data: {
      providerName: providerUser.fullName || "Provider",
      dashboardUrl: appUrl("provider/dashboard", "provider"),
      profileUrl: appUrl("provider/profile", "provider"),
    },
    metadata: {
      entityType: "provider",
      entityId: provider.id,
      userId: providerUser.id,
      idempotencyKey: `provider:${provider.id}:approved`,
    },
  });
}

async function sendProviderDocumentsRequiredEmail(provider, requiredDocuments = ["Updated professional credentials"]) {
  const providerUser = provider.User || (provider.userId ? await User.findByPk(provider.userId) : null);
  if (!providerUser?.email) return null;

  return sendSafely({
    type: EMAIL_TYPES.PROVIDER_DOCUMENTS_REQUIRED,
    to: providerUser.email,
    data: {
      providerName: providerUser.fullName || "Provider",
      requiredDocuments,
      uploadUrl: appUrl(`provider/onboarding/documents`, "provider"),
      supportEmail: emailConfig().defaults.supportEmail,
    },
    metadata: {
      entityType: "provider",
      entityId: provider.id,
      userId: providerUser.id,
      idempotencyKey: `provider:${provider.id}:documents-required`,
    },
  });
}

async function sendWalletTopUpEmail({ user, amount, reference, balance, paymentMethod = "Paystack" }) {
  return sendSafely({
    type: EMAIL_TYPES.WALLET_TOP_UP_SUCCESSFUL,
    to: user.email,
    data: {
      firstName: firstName(user.fullName),
      amount,
      currency: "NGN",
      transactionReference: reference,
      paymentMethod,
      transactionDate: new Date().toISOString(),
      walletBalance: balance,
      walletUrl: appUrl("wallet", "user"),
    },
    metadata: {
      entityType: "transaction",
      entityId: reference,
      userId: user.id,
      transactionId: reference,
      idempotencyKey: `transaction:${reference}:wallet-topup`,
    },
  });
}

async function sendPaymentReceiptEmail({ user, provider, amount, reference, consultationId, split }) {
  const providerUser = provider?.User || (provider?.userId ? await User.findByPk(provider.userId) : null);

  return sendSafely({
    type: EMAIL_TYPES.PAYMENT_RECEIPT,
    to: user.email,
    data: {
      firstName: firstName(user.fullName),
      transactionReference: reference,
      consultationReference: consultationId || reference,
      providerName: providerUser?.fullName || "Iatrics provider",
      serviceDescription: "Iatrics consultation",
      amount,
      platformFee: split?.commission || 0,
      total: amount,
      currency: "NGN",
      paymentDate: new Date().toISOString(),
      receiptUrl: appUrl(`receipts/${reference}`, "user"),
    },
    metadata: {
      entityType: "transaction",
      entityId: reference,
      userId: user.id,
      transactionId: reference,
      idempotencyKey: `transaction:${reference}:payment-receipt`,
    },
  });
}

async function sendWithdrawalSuccessfulEmail(withdrawal) {
  const user = withdrawal.User || (withdrawal.userId ? await User.findByPk(withdrawal.userId) : null);
  if (!user?.email) return null;

  return sendSafely({
    type: EMAIL_TYPES.WITHDRAWAL_SUCCESSFUL,
    to: user.email,
    data: {
      providerName: user.fullName || "Provider",
      amount: withdrawal.amount,
      currency: "NGN",
      bankName: withdrawal.bankCode || "Bank account",
      maskedAccountNumber: maskAccountNumber(withdrawal.accountNumber),
      withdrawalReference: withdrawal.reference || `WD_${withdrawal.id}`,
      processedAt: new Date().toISOString(),
      walletUrl: appUrl("provider/wallet", "provider"),
    },
    metadata: {
      entityType: "withdrawal",
      entityId: withdrawal.id,
      userId: user.id,
      withdrawalId: withdrawal.id,
      idempotencyKey: `withdrawal:${withdrawal.id}:success`,
    },
  });
}

module.exports = {
  appUrl,
  firstName,
  sendAccountVerificationEmail,
  sendAppointmentConfirmation,
  sendPaymentReceiptEmail,
  sendPasswordResetEmail,
  sendProviderApprovedEmail,
  sendProviderDocumentsRequiredEmail,
  sendWalletTopUpEmail,
  sendWelcomeEmail,
  sendWithdrawalSuccessfulEmail,
};
