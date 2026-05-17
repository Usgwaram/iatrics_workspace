const request = require("supertest");
const app = require("../server");

const {
  registerProvider,
} = require("./helpers/providerHelper");

describe("Provider API", () => {
  test("should register provider", async () => {
    const { response } = await registerProvider();

    expect(response.statusCode).toBe(201);

    expect(response.body).toBeDefined();
  });
});