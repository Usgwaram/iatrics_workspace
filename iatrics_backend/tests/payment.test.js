const request = require("supertest");
const app = require("../server");

describe("Payment API", () => {
  test("should initialize payment", async () => {
    const response = await request(app)
      .post("/api/paystack/initialize")
      .send({
        amount: 5000,
        email: `pay${Date.now()}@gmail.com`,
      });

    expect(response.statusCode).toBeLessThan(500);
  });

  test("should preserve provider metadata for consultation commission split", async () => {
    const response = await request(app)
      .post("/api/paystack/initialize")
      .send({
        amount: 5000,
        email: `pay${Date.now()}@gmail.com`,
        providerId: 12,
        consultationId: 34,
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.data.metadata).toEqual({
      providerId: 12,
      consultationId: 34,
      purpose: "consultation",
    });
  });
});
