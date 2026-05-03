const request = require("supertest");
const app = require("../server"); // export express app

describe("Auth API", () => {
  it("should login user", async () => {
    const res = await request(app)
      .post("/api/auth/users/login")
      .send({
        email: "user@test.com",
        password: "123456"
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});