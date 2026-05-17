const request = require("supertest");
const app = require("../server");

const {
  createProvider,
} = require("./helpers/seedHelper");

describe("Schedule API", () => {
  test("should create provider schedule", async () => {
    const provider = await createProvider();

    const response = await request(app)
      .post("/api/schedules")
      .send({
        providerId: provider.id,
        day: "Monday",
        startTime: "09:00",
        endTime: "17:00",
      });

    expect(response.statusCode).toBe(201);
  });

  test("should fetch provider schedules", async () => {
    const provider = await createProvider();

    const response = await request(app).get(
      `/api/schedules/provider?providerId=${provider.id}`
    );

    expect(response.statusCode).toBe(200);
  });
});