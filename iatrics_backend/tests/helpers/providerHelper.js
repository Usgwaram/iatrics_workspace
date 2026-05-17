const request = require("supertest");
const app = require("../../src/app");
const { createUser } = require("./seedHelper");

async function createProvider(token) {
  const payload = {
    licenseNumber: `LIC-${Date.now()}`,
    specialty: "General Medicine",
  };

  const res = await request(app)
    .post("/api/providers")
    .set("Authorization", `Bearer ${token}`)
    .send(payload);

  console.log("PROVIDER RESPONSE:", res.statusCode, res.body);

  if (!res.body || !res.body.provider) {
    throw new Error("Provider creation failed");
  }

  return res.body.provider;
}

async function registerProvider() {
  const user = await createUser();

  const loginRes = await request(app)
    .post("/api/auth/login")
    .send({
      email: user.email,
      password: "Password123!",
    });

  const token = loginRes.body.token || loginRes.body.data?.token;
  const provider = await createProvider(token);

  return {
    provider,
    response: {
      statusCode: 201,
      body: provider,
    },
    token,
    user,
  };
}

module.exports = { createProvider, registerProvider };