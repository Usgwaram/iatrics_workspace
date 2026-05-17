const request = require("supertest");
const app = require("../../src/app");

const generateUserPayload = () => ({
  fullName: "Test User",
  email: `test_${Date.now()}@mail.com`,
  password: "Password123!",
  phone: "08000000000",
});

const registerUser = async (override = {}) => {
  const payload = { ...generateUserPayload(), ...override };

  const response = await request(app)
    .post("/api/auth/register")
    .send(payload);

  return { response, payload };
};

const loginUser = async (email, password) => {
  const response = await request(app)
    .post("/api/auth/login")
    .send({ email, password });

  return response;
};

module.exports = {
  registerUser,
  loginUser,
};