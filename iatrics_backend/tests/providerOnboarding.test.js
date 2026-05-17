const request = require("supertest");
const app = require("../src/app");

const { createUser } = require("./helpers/seedHelper");
const { createProvider } = require("./helpers/providerHelper");

describe("Provider onboarding API", () => {
  async function createProviderSession() {
    const user = await createUser();
    const loginRes = await request(app).post("/api/auth/login").send({
      email: user.email,
      password: "Password123!",
    });
    const token = loginRes.body.token || loginRes.body.data?.token;
    const provider = await createProvider(token);

    return { token, provider };
  }

  test("moves provider through profile, document, and bank onboarding steps", async () => {
    const { token, provider } = await createProviderSession();

    const initialStatus = await request(app)
      .get(`/api/providers/${provider.id}/onboarding/status`)
      .set("Authorization", `Bearer ${token}`);

    expect(initialStatus.statusCode).toBe(200);
    expect(initialStatus.body.onboardingStep).toBe("REGISTERED");

    const profileResponse = await request(app)
      .post(`/api/providers/${provider.id}/onboarding/profile`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        specialty: "Cardiology",
        licenseNumber: `CARD-${Date.now()}`,
        yearsOfExperience: 8,
      });

    expect(profileResponse.statusCode).toBe(200);
    expect(profileResponse.body.provider.onboardingStep).toBe(
      "PROFILE_COMPLETED"
    );
    expect(profileResponse.body.provider.specialty).toBe("Cardiology");

    const documentsResponse = await request(app)
      .post(`/api/providers/${provider.id}/onboarding/documents`)
      .set("Authorization", `Bearer ${token}`)
      .send({ licenseDocumentUrl: "https://example.com/license.pdf" });

    expect(documentsResponse.statusCode).toBe(200);
    expect(documentsResponse.body.provider.onboardingStep).toBe(
      "DOCUMENTS_SUBMITTED"
    );

    const bankResponse = await request(app)
      .post(`/api/providers/${provider.id}/onboarding/bank`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        bankCode: "044",
        accountNumber: "0123456789",
        accountName: "Dr Test",
      });

    expect(bankResponse.statusCode).toBe(200);
    expect(bankResponse.body.provider.onboardingStep).toBe("BANK_SETUP_DONE");
  });
});
