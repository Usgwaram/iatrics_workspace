const request = require("supertest");
const app = require("../src/app"); // IMPORTANT: adjust if your entry file differs
const { registerUser, loginUser } = require("./helpers/authHelper");

describe("Auth API (Production Grade Suite)", () => {
  /**
   * =========================
   * REGISTER TESTS
   * =========================
   */
  describe("POST /auth/register", () => {
    test("should register a new user successfully", async () => {
      const { response, payload } = await registerUser();

      expect(response.statusCode).toBe(201);
      expect(response.body).toBeDefined();

      // Core API contract checks
      expect(response.body.success).not.toBe(false);
      expect(response.body.data || response.body.user).toBeDefined();

      // Ensure email returned matches request
      expect(
        response.body.data?.email || response.body.user?.email
      ).toBe(payload.email);
    });

    test("should reject duplicate email registration", async () => {
      const { payload } = await registerUser();

      const res = await request(app)
        .post("/api/auth/register")
        .send(payload);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test("should reject missing required fields", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ email: "" });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  /**
   * =========================
   * LOGIN TESTS
   * =========================
   */
  describe("POST /auth/login", () => {
    test("should login successfully with valid credentials", async () => {
      const { payload } = await registerUser();

      const response = await loginUser(payload.email, payload.password);

      expect(response.statusCode).toBe(200);
      expect(response.body.token).toBeDefined();
      expect(response.body.user || response.body.data).toBeDefined();
    });

    test("should reject login with invalid password", async () => {
      const { payload } = await registerUser();

      const response = await loginUser(payload.email, "WrongPassword123!");

      expect(response.statusCode).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.token).toBeUndefined();
    });

    test("should reject login with non-existent user", async () => {
      const response = await loginUser(
        "ghostuser@mail.com",
        "Password123!"
      );

      expect(response.statusCode).toBe(404);
      expect(response.body.success).toBe(false);
    });

    test("should reject login when email is missing", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({ password: "Password123!" });

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
});