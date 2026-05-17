const request = require("supertest");
const app = require("../src/app");

const { createUser } = require("./helpers/seedHelper");
const { createProvider } = require("./helpers/providerHelper");

test("should create consultation", async () => {
  const user = await createUser();

  const loginRes = await request(app)
    .post("/api/auth/login")
    .send({
      email: user.email,
      password: "Password123!",
    });

  console.log("LOGIN RESPONSE:", loginRes.statusCode, loginRes.body);

  const token =
    loginRes.body.token ||
    loginRes.body.data?.token;

  expect(token).toBeDefined();

  const provider = await createProvider(token);

  const response = await request(app)
    .post("/api/consultations")
    .set("Authorization", `Bearer ${token}`)
    .send({
      userId: user.id,
      providerId: provider.id,
      symptoms: "Fever and headache",
    });

  console.log("CONSULTATION RESPONSE:", response.statusCode, response.body);

  expect(response.statusCode).toBe(201);
});