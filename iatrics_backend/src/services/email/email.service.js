const crypto = require("crypto");
const validator = require("validator");

const { emailConfig } = require("../../config/email.config");
const { renderEmail } = require("../../emails/emailRenderer");
const { EmailLog } = require("../../models");
const { maskSensitiveData } = require("../../utils/maskSensitiveData");
const { createEmailProvider } = require("./email.providers");
const { EmailProviderError, EmailValidationError } = require("./email.errors");
const { SENDER_CATEGORIES } = require("./email.types");

function formatAddress(name, address) {
  return `${name} <${address}>`;
}

function isHttpsUrl(value) {
  if (!value || typeof value !== "string") return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || process.env.NODE_ENV !== "production";
  } catch (_) {
    return true;
  }
}

function validateSecureLinks(data) {
  if (process.env.NODE_ENV !== "production") return;

  Object.keys(data || {}).forEach((key) => {
    if (key.toLowerCase().endsWith("url") && !isHttpsUrl(data[key])) {
      throw new EmailValidationError("Email links must use HTTPS in production", {
        key,
      });
    }
  });
}

function buildIdempotencyKey({ type, to, metadata = {} }) {
  const stableKey =
    metadata.idempotencyKey ||
    [type, metadata.entityType, metadata.entityId, metadata.userId, metadata.consultationId, metadata.transactionId, metadata.withdrawalId]
      .filter(Boolean)
      .join(":");

  if (!stableKey) return undefined;

  return crypto.createHash("sha256").update(`${to}:${stableKey}`).digest("hex");
}

function getSender(senderCategory, config) {
  const category = SENDER_CATEGORIES[senderCategory] || SENDER_CATEGORIES.notifications;
  return {
    name: category.name || config.defaults.fromName,
    address: category.address || config.defaults.fromAddress,
  };
}

class EmailService {
  constructor(options = {}) {
    this.config = options.config || emailConfig();
    this.provider = createEmailProvider(this.config, options);
    this.logger = options.logger || console;
    this.EmailLog = options.EmailLog || EmailLog;
  }

  async send({ type, to, data = {}, metadata = {} }) {
    if (!type) {
      throw new EmailValidationError("Email type is required");
    }

    if (!to || !validator.isEmail(String(to))) {
      throw new EmailValidationError("Valid email recipient is required", {
        type,
      });
    }

    validateSecureLinks(data);

    const rendered = renderEmail(type, data, {
      config: this.config.defaults,
    });
    const sender = getSender(rendered.sender, this.config);
    const idempotencyKey = buildIdempotencyKey({ type, to, metadata });

    let log = null;
    if (this.EmailLog && idempotencyKey) {
      try {
        log = await this.EmailLog.findOne({ where: { idempotencyKey } });
        if (log?.status === "sent") {
          return {
            success: true,
            provider: log.provider || this.provider.name,
            messageId: log.providerMessageId,
            type,
            duplicate: true,
          };
        }

        if (!log) {
          log = await this.EmailLog.create({
            eventType: type,
            recipient: to,
            provider: this.provider.name,
            status: "pending",
            entityType: metadata.entityType,
            entityId: metadata.entityId ? String(metadata.entityId) : undefined,
            idempotencyKey,
          });
        }
      } catch (err) {
        this.logger.warn?.("[EMAIL] email log unavailable", maskSensitiveData({
          type,
          to,
          code: err.code,
          message: err.message,
        }));
        log = null;
      }
    }

    const attempts = Math.max(1, this.config.retry.attempts);
    let lastError;

    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      try {
        if (log) {
          await log.update({
            attemptCount: attempt,
            status: "sending",
            provider: this.provider.name,
          });
        }

        const result = await this.provider.send({
          type,
          to,
          from: formatAddress(sender.name, sender.address),
          replyTo: this.config.defaults.replyTo,
          subject: rendered.subject,
          html: rendered.html,
          text: rendered.text,
          metadata,
          idempotencyKey,
        });

        if (log) {
          await log.update({
            status: "sent",
            providerMessageId: result.messageId,
            sentAt: new Date(),
            failedAt: null,
            lastErrorCode: null,
          });
        }

        return {
          success: true,
          provider: this.provider.name,
          messageId: result.messageId,
          type,
        };
      } catch (err) {
        lastError = err;
        if (log) {
          await log.update({
            status: "failed",
            failedAt: new Date(),
            lastErrorCode: err.code || "EMAIL_SEND_FAILED",
          });
        }

        this.logger.error("[EMAIL] send failed", maskSensitiveData({
          type,
          provider: this.provider.name,
          to,
          metadata,
          code: err.code,
          message: err.message,
          attempt,
        }));

        if (attempt < attempts) {
          await new Promise((resolve) =>
            setTimeout(resolve, this.config.retry.baseDelayMs * attempt)
          );
        }
      }
    }

    throw new EmailProviderError("Email send failed", {
      type,
      provider: this.provider.name,
      reason: lastError?.message,
    });
  }
}

const emailService = new EmailService();

async function sendSafely(payload, logger = console) {
  try {
    return await emailService.send(payload);
  } catch (err) {
    logger.error("[EMAIL] non-blocking email failure", maskSensitiveData({
      type: payload.type,
      to: payload.to,
      metadata: payload.metadata,
      code: err.code,
      message: err.message,
    }));

    return {
      success: false,
      type: payload.type,
      errorCode: err.code || "EMAIL_SEND_FAILED",
    };
  }
}

module.exports = {
  EmailService,
  buildIdempotencyKey,
  emailService,
  sendSafely,
};
