const fs = require("fs");
const path = require("path");

process.env.EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || "console";

const { EMAIL_TYPES } = require("../src/services/email/email.types");
const { renderEmail } = require("../src/emails/emailRenderer");

const outputDir = path.join(__dirname, "..", "work", "email-previews");

const samples = {
  [EMAIL_TYPES.ACCOUNT_VERIFICATION]: {
    firstName: "Ada",
    verificationUrl: "https://iatrics.ng/verify-account?token=sample",
    expiresInMinutes: 30,
  },
  [EMAIL_TYPES.PASSWORD_RESET]: {
    firstName: "Ada",
    resetUrl: "https://iatrics.ng/reset-password?token=sample",
    expiresInMinutes: 30,
  },
  [EMAIL_TYPES.WELCOME_USER]: { firstName: "Ada", appUrl: "https://iatrics.ng" },
  [EMAIL_TYPES.WELCOME_PROVIDER]: {
    providerName: "Dr Okafor",
    dashboardUrl: "https://iatrics.ng/provider/dashboard",
    profileUrl: "https://iatrics.ng/provider/profile",
  },
  [EMAIL_TYPES.APPOINTMENT_CONFIRMATION]: {
    firstName: "Ada",
    providerName: "Dr Okafor",
    specialty: "General Practice",
    consultationDate: "2026-07-12",
    consultationTime: "10:00",
    timezone: "Africa/Lagos",
    consultationMode: "video",
    consultationReference: "CONSULT_123",
    openConsultationUrl: "https://iatrics.ng/consultations/123",
  },
  [EMAIL_TYPES.CONSULTATION_REMINDER]: {
    firstName: "Ada",
    providerName: "Dr Okafor",
    consultationDate: "2026-07-12",
    consultationTime: "10:00",
    timezone: "Africa/Lagos",
    minutesUntilConsultation: 60,
    joinUrl: "https://iatrics.ng/consultations/123",
  },
  [EMAIL_TYPES.CONSULTATION_COMPLETED]: {
    firstName: "Ada",
    providerName: "Dr Okafor",
    consultationReference: "CONSULT_123",
    reviewUrl: "https://iatrics.ng/consultations/123/review",
    summaryUrl: "https://iatrics.ng/consultations/123",
  },
  [EMAIL_TYPES.PROVIDER_APPROVED]: {
    providerName: "Dr Okafor",
    dashboardUrl: "https://iatrics.ng/provider/dashboard",
    profileUrl: "https://iatrics.ng/provider/profile",
  },
  [EMAIL_TYPES.PROVIDER_DOCUMENTS_REQUIRED]: {
    providerName: "Dr Okafor",
    requiredDocuments: ["Professional licence", "Government-issued identification"],
    uploadUrl: "https://iatrics.ng/provider/onboarding/documents",
    supportEmail: "support@iatrics.ng",
  },
  [EMAIL_TYPES.WALLET_TOP_UP_SUCCESSFUL]: {
    firstName: "Ada",
    amount: 10000,
    currency: "NGN",
    transactionReference: "WALLET_123",
    paymentMethod: "Paystack",
    transactionDate: "2026-07-11T10:00:00.000Z",
    walletBalance: 15000,
    walletUrl: "https://iatrics.ng/wallet",
  },
  [EMAIL_TYPES.PAYMENT_RECEIPT]: {
    firstName: "Ada",
    transactionReference: "CONSULT_123",
    consultationReference: "123",
    providerName: "Dr Okafor",
    serviceDescription: "Iatrics consultation",
    amount: 10000,
    platformFee: 2000,
    total: 10000,
    currency: "NGN",
    paymentDate: "2026-07-11T10:00:00.000Z",
    receiptUrl: "https://iatrics.ng/receipts/CONSULT_123",
  },
  [EMAIL_TYPES.PRESCRIPTION_READY]: {
    firstName: "Ada",
    providerName: "Dr Okafor",
    consultationReference: "CONSULT_123",
    prescriptionUrl: "https://iatrics.ng/prescriptions/123",
  },
  [EMAIL_TYPES.LABORATORY_REQUEST]: {
    firstName: "Ada",
    providerName: "Dr Okafor",
    consultationReference: "CONSULT_123",
    laboratoryRequestUrl: "https://iatrics.ng/lab-requests/123",
  },
  [EMAIL_TYPES.NEW_SECURE_MESSAGE]: {
    firstName: "Ada",
    senderDisplayName: "Dr Okafor",
    conversationUrl: "https://iatrics.ng/messages/123",
  },
  [EMAIL_TYPES.REFERRAL_REWARD]: {
    firstName: "Ada",
    rewardAmount: 1000,
    currency: "NGN",
    walletBalance: 16000,
    referralReference: "REF_123",
    walletUrl: "https://iatrics.ng/wallet",
  },
  [EMAIL_TYPES.WITHDRAWAL_SUCCESSFUL]: {
    providerName: "Dr Okafor",
    amount: 5000,
    currency: "NGN",
    bankName: "Bank",
    maskedAccountNumber: "******1234",
    withdrawalReference: "WD_123",
    processedAt: "2026-07-11T10:00:00.000Z",
    walletUrl: "https://iatrics.ng/provider/wallet",
  },
  [EMAIL_TYPES.BETA_INVITATION_USER]: {
    recipientName: "Ada",
    testerType: "patient",
    platform: "Android",
    downloadUrl: "https://iatrics.ng/beta",
    feedbackUrl: "https://iatrics.ng/feedback",
    supportEmail: "support@iatrics.ng",
  },
  [EMAIL_TYPES.BETA_INVITATION_PROVIDER]: {
    recipientName: "Dr Okafor",
    testerType: "provider",
    platform: "Android",
    downloadUrl: "https://iatrics.ng/beta/provider",
    feedbackUrl: "https://iatrics.ng/feedback",
    supportEmail: "support@iatrics.ng",
  },
};

fs.mkdirSync(outputDir, { recursive: true });

Object.entries(samples).forEach(([type, data]) => {
  const rendered = renderEmail(type, data);
  fs.writeFileSync(path.join(outputDir, `${type}.html`), rendered.html);
  fs.writeFileSync(path.join(outputDir, `${type}.txt`), rendered.text);
});

console.log(`Email previews written to ${outputDir}`);
