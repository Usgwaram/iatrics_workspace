const { renderEmail } = require("../../src/emails/emailRenderer");
const { EMAIL_TYPES } = require("../../src/services/email/email.types");
const { formatMoney } = require("../../src/emails/templates/templateHelpers");

describe("email renderer", () => {
  test("renders escaped HTML and plain text", () => {
    const rendered = renderEmail(EMAIL_TYPES.ACCOUNT_VERIFICATION, {
      firstName: "<Ada>",
      verificationUrl: "https://iatrics.ng/verify?token=sample",
      expiresInMinutes: 30,
    });

    expect(rendered.subject).toBe("Verify your Iatrics account");
    expect(rendered.html).toContain("&lt;Ada&gt;");
    expect(rendered.html).not.toContain("<Ada>");
    expect(rendered.text).toContain("<Ada>");
  });

  test("validates required template data", () => {
    expect(() =>
      renderEmail(EMAIL_TYPES.PASSWORD_RESET, {
        firstName: "Ada",
      })
    ).toThrow("Missing required email template data");
  });

  test("formats Nigerian naira", () => {
    expect(formatMoney(1500, "NGN")).toContain("1,500.00");
    expect(formatMoney(1500, "NGN")).toContain("₦");
  });

  test("does not include secure message contents", () => {
    const rendered = renderEmail(EMAIL_TYPES.NEW_SECURE_MESSAGE, {
      firstName: "Ada",
      senderDisplayName: "Dr Okafor",
      conversationUrl: "https://iatrics.ng/messages/1",
      message: "sensitive message body",
    });

    expect(rendered.html).not.toContain("sensitive message body");
    expect(rendered.text).not.toContain("sensitive message body");
  });
});
