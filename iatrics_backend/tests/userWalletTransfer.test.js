const request = require("supertest");
const app = require("../src/app");
const { WalletTransaction } = require("../src/models");

const { createUser } = require("./helpers/seedHelper");

async function createSession() {
  const user = await createUser();
  const loginRes = await request(app).post("/api/auth/login").send({
    email: user.email,
    password: "Password123!",
  });

  return {
    user,
    token: loginRes.body.token,
  };
}

describe("User wallet and bank transfer API", () => {
  test("initializes wallet top-up with user metadata", async () => {
    const { token, user } = await createSession();

    const response = await request(app)
      .post("/api/wallet/topup")
      .set("Authorization", `Bearer ${token}`)
      .send({ amount: 5000 });

    expect(response.statusCode).toBe(200);
    expect(response.body.data.authorization_url).toBeTruthy();
    expect(response.body.data.metadata).toEqual({
      userId: user.id,
      purpose: "wallet_topup",
    });
  });

  test("shows balance, requests bank transfer, and records transaction", async () => {
    const { token, user } = await createSession();

    await WalletTransaction.create({
      userId: user.id,
      amount: 10000,
      type: "credit",
      status: "confirmed",
      reference: `TEST_TOPUP_${Date.now()}`,
      source: "paystack",
    });

    const balanceResponse = await request(app)
      .get("/api/wallet/balance")
      .set("Authorization", `Bearer ${token}`);

    expect(balanceResponse.statusCode).toBe(200);
    expect(balanceResponse.body.balance).toBe(10000);

    const withdrawalResponse = await request(app)
      .post("/api/withdrawals/request")
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: 2500,
        bankCode: "044",
        accountNumber: "0123456789",
        accountName: "Test User",
      });

    expect(withdrawalResponse.statusCode).toBe(200);
    expect(withdrawalResponse.body.success).toBe(true);
    expect(withdrawalResponse.body.balance).toBe(7500);

    const transactionsResponse = await request(app)
      .get("/api/wallet/transactions")
      .set("Authorization", `Bearer ${token}`);

    expect(transactionsResponse.statusCode).toBe(200);
    expect(transactionsResponse.body.transactions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: "debit",
          amount: 2500,
          source: "bank_transfer",
        }),
      ])
    );

    const withdrawalsResponse = await request(app)
      .get("/api/withdrawals/me")
      .set("Authorization", `Bearer ${token}`);

    expect(withdrawalsResponse.statusCode).toBe(200);
    expect(withdrawalsResponse.body.withdrawals).toHaveLength(1);
  });

  test("rejects bank transfer when balance is too low", async () => {
    const { token } = await createSession();

    const response = await request(app)
      .post("/api/withdrawals/request")
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: 2500,
        bankCode: "044",
        accountNumber: "0123456789",
      });

    expect(response.statusCode).toBe(500);
    expect(response.body.error).toBe("Insufficient funds");
  });
});
