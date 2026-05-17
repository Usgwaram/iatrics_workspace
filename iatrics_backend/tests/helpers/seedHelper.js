// tests/helpers/seedHelper.js
const request = require("supertest");
const app = require("../../src/app");

async function createUser() {
  const payload = {
    fullName: "Test User",
    email: `user_${Date.now()}@test.com`,
    password: "Password123!",
    phone: "08000000000",
  };

  const res = await request(app)
    .post("/api/auth/register")
    .send(payload);

  console.log("USER RESPONSE:", res.status, res.body);

  if (!res.body || !res.body.data) {
    throw new Error("User creation failed");
  }

  return res.body.data;
}

async function createProvider() {
  const user = await createUser();

  const loginRes = await request(app)
    .post("/api/auth/login")
    .send({
      email: user.email,
      password: "Password123!",
    });

  const token = loginRes.body.token || loginRes.body.data?.token;

  const res = await request(app)
    .post("/api/providers")
    .set("Authorization", `Bearer ${token}`)
    .send({
      licenseNumber: `LIC-${Date.now()}`,
      specialty: "General Medicine",
    });

  console.log("PROVIDER RESPONSE:", res.status, res.body);

  if (!res.body || !res.body.provider) {
    throw new Error("Provider creation failed");
  }

  return res.body.provider;
}

module.exports = {
  createUser,
  createProvider,
};