const bcrypt = require("bcrypt");
const request = require("supertest");

const app = require("../src/app");
const db = require("../src/models");
const { hashToken } = require("../src/services/authTokenService");

function uniqueEmail(prefix = "auth_email") {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 100000)}@test.com`;
}

async function findUser(email) {
  return db.User.findOne({ where: { email } });
}

describe("Auth email verification and password reset", () => {
  beforeEach(() => {
    process.env.AUTH_RATE_LIMIT_MAX = "1000";
    process.env.EMAIL_CONSOLE_FAIL = "false";
    process.env.EMAIL_VERIFICATION_RESEND_COOLDOWN_SECONDS = "1";
    process.env.PASSWORD_RESET_COOLDOWN_SECONDS = "1";
    process.env.AUTH_TEST_TOKEN = `test-token-${Date.now()}-${Math.random()}`;
  });

  test("registration issues a hashed verification token without returning the raw token", async () => {
    const email = uniqueEmail();
    const token = process.env.AUTH_TEST_TOKEN;

    const response = await request(app)
      .post("/api/auth/register")
      .send({
        fullName: "Ada Test",
        email,
        password: "Password123!",
        phone: "08000000000",
      });

    expect(response.statusCode).toBe(201);
    expect(JSON.stringify(response.body)).not.toContain(token);

    const user = await findUser(email);

    expect(user.emailVerificationTokenHash).toBe(hashToken(token));
    expect(user.emailVerificationTokenHash).not.toBe(token);
    expect(user.emailVerificationExpiresAt).toBeTruthy();
    expect(user.emailVerificationSentAt).toBeTruthy();
    expect(user.emailVerifiedAt).toBeFalsy();
  });

  test("verification succeeds once, clears token fields, and reused token fails", async () => {
    const email = uniqueEmail();
    const token = process.env.AUTH_TEST_TOKEN;

    await request(app)
      .post("/api/auth/register")
      .send({
        fullName: "Ada Verify",
        email,
        password: "Password123!",
      });

    const first = await request(app)
      .post("/api/auth/verify-email")
      .send({ token });

    expect(first.statusCode).toBe(200);
    expect(first.body.data.emailVerified).toBe(true);

    const user = await findUser(email);
    expect(user.emailVerifiedAt).toBeTruthy();
    expect(user.emailVerificationTokenHash).toBeNull();
    expect(user.emailVerificationExpiresAt).toBeNull();

    const reused = await request(app)
      .post("/api/auth/verify-email")
      .send({ token });

    expect(reused.statusCode).toBe(400);
  });

  test("expired and invalid verification tokens fail", async () => {
    const email = uniqueEmail();
    const token = process.env.AUTH_TEST_TOKEN;

    await request(app)
      .post("/api/auth/register")
      .send({
        fullName: "Ada Expired",
        email,
        password: "Password123!",
      });

    await db.User.update(
      { emailVerificationExpiresAt: new Date(Date.now() - 1000) },
      { where: { email } }
    );

    const expired = await request(app)
      .post("/api/auth/verify-email")
      .send({ token });

    const invalid = await request(app)
      .post("/api/auth/verify-email")
      .send({ token: "not-the-token" });

    expect(expired.statusCode).toBe(400);
    expect(invalid.statusCode).toBe(400);
  });

  test("resend is enumeration-safe and invalidates the previous verification token", async () => {
    const email = uniqueEmail();
    const firstToken = process.env.AUTH_TEST_TOKEN;

    await request(app)
      .post("/api/auth/register")
      .send({
        fullName: "Ada Resend",
        email,
        password: "Password123!",
      });

    await db.User.update(
      { emailVerificationSentAt: new Date(Date.now() - 3000) },
      { where: { email } }
    );

    process.env.AUTH_TEST_TOKEN = `replacement-token-${Date.now()}`;

    const existing = await request(app)
      .post("/api/auth/resend-verification")
      .send({ email });
    const nonexistent = await request(app)
      .post("/api/auth/resend-verification")
      .send({ email: uniqueEmail("missing") });

    expect(existing.statusCode).toBe(200);
    expect(nonexistent.statusCode).toBe(200);
    expect(existing.body.message).toBe(nonexistent.body.message);

    const oldTokenResult = await request(app)
      .post("/api/auth/verify-email")
      .send({ token: firstToken });

    expect(oldTokenResult.statusCode).toBe(400);
  });

  test("password reset request is generic and stores only the token hash", async () => {
    const email = uniqueEmail();
    const token = process.env.AUTH_TEST_TOKEN;

    await db.User.create({
      fullName: "Ada Reset",
      email,
      password: await bcrypt.hash("Password123!", 10),
      isVerified: true,
      emailVerifiedAt: new Date(),
    });

    const existing = await request(app)
      .post("/api/auth/password-reset/request")
      .send({ email });
    const nonexistent = await request(app)
      .post("/api/auth/password-reset/request")
      .send({ email: uniqueEmail("missing_reset") });

    expect(existing.statusCode).toBe(200);
    expect(nonexistent.statusCode).toBe(200);
    expect(existing.body.message).toBe(nonexistent.body.message);

    const user = await findUser(email);
    expect(user.passwordResetTokenHash).toBe(hashToken(token));
    expect(user.passwordResetTokenHash).not.toBe(token);
  });

  test("password reset succeeds once, hashes password, and clears token fields", async () => {
    const email = uniqueEmail();
    const token = process.env.AUTH_TEST_TOKEN;
    const oldPasswordHash = await bcrypt.hash("Password123!", 10);

    await db.User.create({
      fullName: "Ada Complete Reset",
      email,
      password: oldPasswordHash,
      isVerified: true,
      emailVerifiedAt: new Date(),
    });

    await request(app)
      .post("/api/auth/password-reset/request")
      .send({ email });

    const reset = await request(app)
      .post("/api/auth/password-reset/confirm")
      .send({ token, password: "NewPassword123!" });

    expect(reset.statusCode).toBe(200);

    const user = await findUser(email);
    expect(user.passwordResetTokenHash).toBeNull();
    expect(user.passwordResetExpiresAt).toBeNull();
    expect(await bcrypt.compare("Password123!", user.password)).toBe(false);
    expect(await bcrypt.compare("NewPassword123!", user.password)).toBe(true);

    const reused = await request(app)
      .post("/api/auth/password-reset/confirm")
      .send({ token, password: "AnotherPassword123!" });

    expect(reused.statusCode).toBe(400);

    const loginOld = await request(app)
      .post("/api/auth/login")
      .send({ email, password: "Password123!" });
    const loginNew = await request(app)
      .post("/api/auth/login")
      .send({ email, password: "NewPassword123!" });

    expect(loginOld.statusCode).toBe(401);
    expect(loginNew.statusCode).toBe(200);
  });

  test("expired and invalid password reset tokens fail", async () => {
    const email = uniqueEmail();
    const token = process.env.AUTH_TEST_TOKEN;

    await db.User.create({
      fullName: "Ada Expired Reset",
      email,
      password: await bcrypt.hash("Password123!", 10),
    });

    await request(app)
      .post("/api/auth/password-reset/request")
      .send({ email });

    await db.User.update(
      { passwordResetExpiresAt: new Date(Date.now() - 1000) },
      { where: { email } }
    );

    const expired = await request(app)
      .post("/api/auth/password-reset/confirm")
      .send({ token, password: "NewPassword123!" });
    const invalid = await request(app)
      .post("/api/auth/password-reset/confirm")
      .send({ token: "invalid-token", password: "NewPassword123!" });

    expect(expired.statusCode).toBe(400);
    expect(invalid.statusCode).toBe(400);
  });

  test("raw tokens are absent from console error logs", async () => {
    const token = process.env.AUTH_TEST_TOKEN;
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});

    await request(app)
      .post("/api/auth/verify-email")
      .send({ token: "invalid-token" });

    expect(JSON.stringify(spy.mock.calls)).not.toContain(token);
    spy.mockRestore();
  });

  test("email provider failure does not delete accounts or expose reset existence", async () => {
    const email = uniqueEmail();
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    process.env.EMAIL_CONSOLE_FAIL = "true";

    const registration = await request(app)
      .post("/api/auth/register")
      .send({
        fullName: "Ada Email Failure",
        email,
        password: "Password123!",
      });

    expect(registration.statusCode).toBe(201);
    expect(await findUser(email)).toBeTruthy();

    const existing = await request(app)
      .post("/api/auth/password-reset/request")
      .send({ email });
    const nonexistent = await request(app)
      .post("/api/auth/password-reset/request")
      .send({ email: uniqueEmail("missing_failure") });

    expect(existing.statusCode).toBe(200);
    expect(nonexistent.statusCode).toBe(200);
    expect(existing.body.message).toBe(nonexistent.body.message);
    expect(JSON.stringify(spy.mock.calls)).not.toContain(process.env.AUTH_TEST_TOKEN);

    process.env.EMAIL_CONSOLE_FAIL = "false";
    spy.mockRestore();
  });
});
