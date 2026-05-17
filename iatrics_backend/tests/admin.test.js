const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const request = require("supertest");

const app = require("../src/app");
const db = require("../src/models");

const password = "Admin123!";
const secret = process.env.JWT_SECRET || "secretkey";

function createAdminToken() {
  return jwt.sign({ id: 1, role: "admin" }, secret, { expiresIn: "1h" });
}

function createUserToken() {
  return jwt.sign({ id: 2, role: "USER" }, secret, { expiresIn: "1h" });
}

describe("Admin API pathway", () => {
  test("rejects unauthenticated admin requests", async () => {
    const response = await request(app).get("/api/admin/summary");

    expect(response.statusCode).toBe(401);
  });

  test("rejects non-admin users", async () => {
    const token = await createUserToken();

    const response = await request(app)
      .get("/api/admin/summary")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(403);
  });

  test("returns admin summary for admin users", async () => {
    const token = await createAdminToken();

    const response = await request(app)
      .get("/api/admin/summary")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("totalUsers");
    expect(response.body).toHaveProperty("totalProviders");
    expect(response.body).toHaveProperty("pendingWithdrawals");
  });

  test("lists users and providers", async () => {
    const token = await createAdminToken();

    const usersResponse = await request(app)
      .get("/api/admin/users")
      .set("Authorization", `Bearer ${token}`);

    const providersResponse = await request(app)
      .get("/api/admin/providers")
      .set("Authorization", `Bearer ${token}`);

    expect(usersResponse.statusCode).toBe(200);
    expect(Array.isArray(usersResponse.body)).toBe(true);
    expect(providersResponse.statusCode).toBe(200);
    expect(Array.isArray(providersResponse.body)).toBe(true);
  });

  test("approves provider", async () => {
    const token = await createAdminToken();
    const user = await db.User.create(
      {
        fullName: "Provider User",
        email: `provider_user_${Date.now()}@test.com`,
        phone: "08000000002",
        password: await bcrypt.hash(password, 10),
        role: "USER",
      }
    );
    const provider = await db.Provider.create(
      {
        userId: user.id,
        specialty: "General Medicine",
        licenseNumber: `ADMIN-LIC-${Date.now()}`,
      }
    );

    const response = await request(app)
      .post(`/api/admin/providers/${provider.id}/approve`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.provider.isApproved).toBe(true);
    expect(response.body.provider.onboardingStep).toBe("APPROVED");
  });

  test("approves pending withdrawal", async () => {
    const token = await createAdminToken();
    const user = await db.User.create(
      {
        fullName: "Withdrawal User",
        email: `withdrawal_user_${Date.now()}@test.com`,
        phone: "08000000003",
        password: await bcrypt.hash(password, 10),
        role: "USER",
      }
    );
    const reference = `WD_ADMIN_${Date.now()}`;
    const withdrawal = await db.Withdrawal.create(
      {
        userId: user.id,
        amount: 1000,
        status: "pending",
        bankCode: "044",
        accountNumber: "0123456789",
      }
    );
    await db.WalletTransaction.create(
      {
        userId: user.id,
        type: "debit",
        amount: 1000,
        status: "pending",
        reference,
        source: "withdrawal",
      }
    );

    const response = await request(app)
      .post(`/api/admin/withdrawals/${withdrawal.id}/approve`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("Withdrawal approved");
  });
});
