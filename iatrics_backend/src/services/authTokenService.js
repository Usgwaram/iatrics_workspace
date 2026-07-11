const crypto = require("crypto");
const { Op } = require("sequelize");

const { User } = require("../models");
const { authConfig } = require("../config/auth.config");
const {
  sendAccountVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
} = require("./email/email.workflow");

function generateToken() {
  if (process.env.JEST_WORKER_ID && process.env.AUTH_TEST_TOKEN) {
    return process.env.AUTH_TEST_TOKEN;
  }

  return crypto.randomBytes(32).toString("hex");
}

function hashToken(token) {
  return crypto.createHash("sha256").update(String(token)).digest("hex");
}

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function secondsSince(date, now = new Date()) {
  if (!date) return Infinity;
  return Math.floor((now.getTime() - new Date(date).getTime()) / 1000);
}

function appendToken(url, token) {
  const parsed = new URL(url);
  parsed.searchParams.set("token", token);
  return parsed.toString();
}

function verificationBaseUrl(user) {
  const config = authConfig();
  return user.role === "PROVIDER"
    ? config.providerWebVerificationUrl
    : config.userWebVerificationUrl;
}

function passwordResetBaseUrl(user) {
  const config = authConfig();
  return user.role === "PROVIDER"
    ? config.providerWebPasswordResetUrl
    : config.userWebPasswordResetUrl;
}

function validatePasswordStrength(password) {
  if (
    typeof password !== "string" ||
    password.length < 8 ||
    !/[A-Z]/.test(password) ||
    !/[a-z]/.test(password) ||
    !/[0-9]/.test(password)
  ) {
    return false;
  }

  return true;
}

async function issueEmailVerification(user, { transaction = null, force = false } = {}) {
  const config = authConfig();
  const now = new Date();

  if (
    !force &&
    user.emailVerificationSentAt &&
    secondsSince(user.emailVerificationSentAt, now) <
      config.emailVerificationResendCooldownSeconds
  ) {
    return {
      sent: false,
      cooldown: true,
    };
  }

  const token = generateToken();
  const expiresAt = addMinutes(now, config.emailVerificationExpiresMinutes);

  await user.update(
    {
      isVerified: false,
      emailVerifiedAt: null,
      emailVerificationTokenHash: hashToken(token),
      emailVerificationExpiresAt: expiresAt,
      emailVerificationSentAt: now,
    },
    { transaction }
  );

  const verificationUrl = appendToken(verificationBaseUrl(user), token);

  return {
    sent: true,
    token,
    verificationUrl,
    expiresAt,
    expiresInMinutes: config.emailVerificationExpiresMinutes,
  };
}

async function sendIssuedVerificationEmail(user, issued) {
  if (!issued?.sent) return issued;

  await sendAccountVerificationEmail(user, {
    verificationUrl: issued.verificationUrl,
    expiresInMinutes: issued.expiresInMinutes,
    sentAt: user.emailVerificationSentAt || new Date(),
  });

  return issued;
}

async function verifyEmailToken(token, { transaction = null } = {}) {
  const tokenHash = hashToken(token || "");
  const now = new Date();

  const user = await User.findOne({
    where: {
      emailVerificationTokenHash: tokenHash,
      emailVerificationExpiresAt: { [Op.gt]: now },
    },
    transaction,
    lock: transaction ? transaction.LOCK.UPDATE : undefined,
  });

  if (!user) {
    return {
      success: false,
      reason: "invalid_or_expired",
    };
  }

  await user.update(
    {
      isVerified: true,
      emailVerifiedAt: now,
      emailVerificationTokenHash: null,
      emailVerificationExpiresAt: null,
      emailVerificationSentAt: null,
    },
    { transaction }
  );

  return {
    success: true,
    user,
  };
}

async function requestPasswordReset(user, { transaction = null, force = false } = {}) {
  if (!user) {
    return {
      sent: false,
      nonexistent: true,
    };
  }

  const config = authConfig();
  const now = new Date();

  if (
    !force &&
    user.passwordResetRequestedAt &&
    secondsSince(user.passwordResetRequestedAt, now) < config.passwordResetCooldownSeconds
  ) {
    return {
      sent: false,
      cooldown: true,
    };
  }

  const token = generateToken();
  const expiresAt = addMinutes(now, config.passwordResetExpiresMinutes);

  await user.update(
    {
      passwordResetTokenHash: hashToken(token),
      passwordResetExpiresAt: expiresAt,
      passwordResetRequestedAt: now,
    },
    { transaction }
  );

  const resetUrl = appendToken(passwordResetBaseUrl(user), token);

  return {
    sent: true,
    token,
    resetUrl,
    expiresAt,
    expiresInMinutes: config.passwordResetExpiresMinutes,
  };
}

async function sendIssuedPasswordResetEmail(user, issued) {
  if (!user || !issued?.sent) return issued;

  await sendPasswordResetEmail(user, {
    resetUrl: issued.resetUrl,
    expiresInMinutes: issued.expiresInMinutes,
    requestedAt: user.passwordResetRequestedAt || new Date(),
  });

  return issued;
}

async function findUserForPasswordReset(token, { transaction = null } = {}) {
  const tokenHash = hashToken(token || "");
  const now = new Date();

  return User.findOne({
    where: {
      passwordResetTokenHash: tokenHash,
      passwordResetExpiresAt: { [Op.gt]: now },
    },
    transaction,
    lock: transaction ? transaction.LOCK.UPDATE : undefined,
  });
}

module.exports = {
  findUserForPasswordReset,
  generateToken,
  hashToken,
  issueEmailVerification,
  requestPasswordReset,
  sendIssuedPasswordResetEmail,
  sendIssuedVerificationEmail,
  validatePasswordStrength,
  verifyEmailToken,
};
