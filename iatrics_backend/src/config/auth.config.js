function bool(value, fallback = false) {
  if (value === undefined || value === null || value === "") return fallback;
  return String(value).toLowerCase() === "true";
}

function numberEnv(name, fallback) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function authConfig() {
  const appWebUrl = process.env.APP_WEB_URL || "https://iatrics.ng";

  return {
    requireEmailVerification: bool(process.env.REQUIRE_EMAIL_VERIFICATION, false),
    emailVerificationExpiresMinutes: numberEnv("EMAIL_VERIFICATION_EXPIRES_MINUTES", 1440),
    emailVerificationResendCooldownSeconds: numberEnv("EMAIL_VERIFICATION_RESEND_COOLDOWN_SECONDS", 300),
    passwordResetExpiresMinutes: numberEnv("PASSWORD_RESET_EXPIRES_MINUTES", 30),
    passwordResetCooldownSeconds: numberEnv("PASSWORD_RESET_COOLDOWN_SECONDS", 300),
    userWebVerificationUrl:
      process.env.USER_WEB_VERIFICATION_URL || `${appWebUrl.replace(/\/$/, "")}/verify-email`,
    userWebPasswordResetUrl:
      process.env.USER_WEB_PASSWORD_RESET_URL || `${appWebUrl.replace(/\/$/, "")}/reset-password`,
    providerWebVerificationUrl:
      process.env.PROVIDER_WEB_VERIFICATION_URL || `${appWebUrl.replace(/\/$/, "")}/provider/verify-email`,
    providerWebPasswordResetUrl:
      process.env.PROVIDER_WEB_PASSWORD_RESET_URL || `${appWebUrl.replace(/\/$/, "")}/provider/reset-password`,
  };
}

module.exports = {
  authConfig,
};
