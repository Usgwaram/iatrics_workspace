const request = require("supertest");
const app = require("../../server");

async function createUser() {
  const response = await request(app)
    .post("/api/auth/register")
    .send({
      email: `user${Date.now()}@test.com`,
      password: "password123",
      name: "Test User",
    });

  return {
    response,
    payload: response.body,
  };
}

module.exports = {
  createUser,
};