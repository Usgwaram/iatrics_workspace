const axios = require("axios");

class ConsultationSimulator {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.userToken = null;
    this.providerToken = null;
    this.consultationId = null;
  }

  // =========================
  // LOGIN USER
  // =========================
  async loginUser() {
    const res = await axios.post(
      `${this.baseUrl}/api/auth/users/login`,
      {
        email: "user@test.com",
        password: "123456"
      }
    );

    this.userToken = res.data.data.token;
    return this.userToken;
  }

  // =========================
  // LOGIN PROVIDER
  // =========================
  async loginProvider() {
    const res = await axios.post(
      `${this.baseUrl}/api/auth/providers/login`,
      {
        email: "provider@test.com",
        password: "123456"
      }
    );

    this.providerToken = res.data.data.token;
    return this.providerToken;
  }

  // =========================
  // CREATE CONSULTATION
  // =========================
  async createConsultation() {
    const res = await axios.post(
      `${this.baseUrl}/api/consultations`,
      {
        providerId: 1,
        type: "video"
      },
      {
        headers: { Authorization: `Bearer ${this.userToken}` }
      }
    );

    this.consultationId = res.data.data.id;
    return this.consultationId;
  }

  // =========================
  // ACCEPT CONSULTATION
  // =========================
  async acceptConsultation() {
    return axios.post(
      `${this.baseUrl}/api/consultations/${this.consultationId}/accept`,
      {},
      {
        headers: { Authorization: `Bearer ${this.providerToken}` }
      }
    );
  }

  // =========================
  // GET AGORA TOKEN
  // =========================
  async getAgoraToken(role = "user") {
    const token = role === "user" ? this.userToken : this.providerToken;

    const res = await axios.get(
      `${this.baseUrl}/api/agora/token/${this.consultationId}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    return res.data.data.token;
  }

  // =========================
  // END CONSULTATION
  // =========================
  async endConsultation() {
    return axios.post(
      `${this.baseUrl}/api/consultations/${this.consultationId}/end`,
      {},
      {
        headers: { Authorization: `Bearer ${this.providerToken}` }
      }
    );
  }

  // =========================
  // RUN FULL FLOW
  // =========================
  async run() {
    console.log("🚀 Starting Consultation Simulation...");

    await this.loginUser();
    console.log("✅ User logged in");

    await this.loginProvider();
    console.log("✅ Provider logged in");

    await this.createConsultation();
    console.log("📌 Consultation created:", this.consultationId);

    await this.acceptConsultation();
    console.log("🤝 Provider accepted");

    const userToken = await this.getAgoraToken("user");
    const providerToken = await this.getAgoraToken("provider");

    console.log("🎥 Agora tokens generated");

    // simulate call duration
    console.log("📞 Call started...");
    await new Promise((r) => setTimeout(r, 3000));

    await this.endConsultation();
    console.log("📴 Call ended");

    return {
      consultationId: this.consultationId,
      userToken,
      providerToken
    };
  }
}

module.exports = ConsultationSimulator;