const { EmailService } = require("../../src/services/email/email.service");
const { EMAIL_TYPES } = require("../../src/services/email/email.types");

function createEmailLogMock() {
  const records = new Map();

  return {
    records,
    async findOne({ where }) {
      return records.get(where.idempotencyKey) || null;
    },
    async create(data) {
      const record = {
        ...data,
        async update(next) {
          Object.assign(record, next);
          return record;
        },
      };
      records.set(data.idempotencyKey, record);
      return record;
    },
  };
}

function createService(options = {}) {
  return new EmailService({
    config: {
      provider: "console",
      defaults: {
        appName: "Iatrics",
        appWebUrl: "https://iatrics.ng",
        appApiUrl: "https://api.iatrics.ng",
        userAppUrl: "https://iatrics.ng",
        providerAppUrl: "https://iatrics.ng",
        logoUrl: "",
        fromName: "Iatrics",
        fromAddress: "notifications@iatrics.ng",
        replyTo: "support@iatrics.ng",
        supportEmail: "support@iatrics.ng",
      },
      retry: { attempts: 1, baseDelayMs: 1 },
    },
    provider: options.provider || {
      name: "mock",
      async send(message) {
        return {
          messageId: `mock_${message.type}`,
          message,
        };
      },
    },
    logger: {
      info: jest.fn(),
      error: jest.fn(),
    },
    EmailLog: options.EmailLog || createEmailLogMock(),
  });
}

describe("email service", () => {
  test("selects sender and reply-to values", async () => {
    const sent = [];
    const service = createService({
      provider: {
        name: "mock",
        async send(message) {
          sent.push(message);
          return { messageId: "message_1" };
        },
      },
    });

    await service.send({
      type: EMAIL_TYPES.ACCOUNT_VERIFICATION,
      to: "ada@example.com",
      data: {
        firstName: "Ada",
        verificationUrl: "https://iatrics.ng/verify",
        expiresInMinutes: 30,
      },
      metadata: { entityType: "user", entityId: 1 },
    });

    expect(sent[0].from).toBe("Iatrics Accounts <accounts@iatrics.ng>");
    expect(sent[0].replyTo).toBe("support@iatrics.ng");
  });

  test("prevents duplicate sends with idempotency key", async () => {
    const provider = {
      name: "mock",
      send: jest.fn().mockResolvedValue({ messageId: "message_1" }),
    };
    const EmailLog = createEmailLogMock();
    const service = createService({ provider, EmailLog });
    const payload = {
      type: EMAIL_TYPES.WALLET_TOP_UP_SUCCESSFUL,
      to: "ada@example.com",
      data: {
        firstName: "Ada",
        amount: 1000,
        currency: "NGN",
        transactionReference: "TX_1",
        paymentMethod: "Paystack",
        transactionDate: "2026-07-11",
        walletBalance: 2000,
        walletUrl: "https://iatrics.ng/wallet",
      },
      metadata: { entityType: "transaction", entityId: "TX_1" },
    };

    const first = await service.send(payload);
    const second = await service.send(payload);

    expect(first.success).toBe(true);
    expect(second.duplicate).toBe(true);
    expect(provider.send).toHaveBeenCalledTimes(1);
  });

  test("rejects invalid email addresses", async () => {
    const service = createService();

    await expect(
      service.send({
        type: EMAIL_TYPES.ACCOUNT_VERIFICATION,
        to: "bad",
        data: {
          firstName: "Ada",
          verificationUrl: "https://iatrics.ng/verify",
          expiresInMinutes: 30,
        },
      })
    ).rejects.toThrow("Valid email recipient is required");
  });

  test("uses sanitized logging for provider failures", async () => {
    const logger = { info: jest.fn(), error: jest.fn() };
    const service = new EmailService({
      config: {
        provider: "console",
        defaults: {
          appWebUrl: "https://iatrics.ng",
          appApiUrl: "https://api.iatrics.ng",
          replyTo: "support@iatrics.ng",
          supportEmail: "support@iatrics.ng",
        },
        retry: { attempts: 1, baseDelayMs: 1 },
      },
      provider: {
        name: "mock",
        async send() {
          throw new Error("provider token abc123");
        },
      },
      logger,
      EmailLog: createEmailLogMock(),
    });

    await expect(
      service.send({
        type: EMAIL_TYPES.PASSWORD_RESET,
        to: "ada@example.com",
        data: {
          firstName: "Ada",
          resetUrl: "https://iatrics.ng/reset?token=secret",
          expiresInMinutes: 30,
        },
        metadata: {
          resetToken: "secret",
          entityType: "user",
          entityId: 1,
        },
      })
    ).rejects.toThrow("Email send failed");

    expect(JSON.stringify(logger.error.mock.calls)).not.toContain("secret");
  });
});
