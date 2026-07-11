const DEFAULT_PROVIDER = "console";
const SUPPORTED_PROVIDERS = ["resend", "smtp", "console"];

function bool(value, fallback = false) {
  if (value === undefined || value === null || value === "") return fallback;
  return String(value).toLowerCase() === "true";
}

function emailConfig() {
  const provider = (process.env.EMAIL_PROVIDER || DEFAULT_PROVIDER).toLowerCase();

  return {
    provider: SUPPORTED_PROVIDERS.includes(provider) ? provider : DEFAULT_PROVIDER,
    resend: {
      apiKey: process.env.RESEND_API_KEY,
    },
    smtp: {
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT || 587),
      secure: bool(process.env.SMTP_SECURE, false),
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    defaults: {
      appName: process.env.APP_NAME || "Iatrics",
      appWebUrl: process.env.APP_WEB_URL || "https://iatrics.ng",
      appApiUrl: process.env.APP_API_URL || process.env.APP_BASE_URL || "https://api.iatrics.ng",
      userAppUrl: process.env.USER_APP_URL || process.env.APP_WEB_URL || "https://iatrics.ng",
      providerAppUrl: process.env.PROVIDER_APP_URL || process.env.APP_WEB_URL || "https://iatrics.ng",
      logoUrl: process.env.EMAIL_LOGO_URL || "",
      fromName: process.env.EMAIL_FROM_NAME || "Iatrics",
      fromAddress: process.env.EMAIL_FROM_ADDRESS || "notifications@iatrics.ng",
      replyTo: process.env.EMAIL_REPLY_TO || process.env.SUPPORT_EMAIL || "support@iatrics.ng",
      supportEmail: process.env.SUPPORT_EMAIL || "support@iatrics.ng",
      infoEmail: process.env.INFO_EMAIL || "info@iatrics.ng",
      mediaEmail: process.env.MEDIA_EMAIL || "media@iatrics.ng",
      marketingEmail: process.env.MARKETING_EMAIL || "marketing@iatrics.ng",
    },
    retry: {
      attempts: Number(process.env.EMAIL_RETRY_ATTEMPTS || 2),
      baseDelayMs: Number(process.env.EMAIL_RETRY_BASE_DELAY_MS || 250),
    },
  };
}

module.exports = {
  SUPPORTED_PROVIDERS,
  emailConfig,
};
