import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:iatrics_provider_app/core/network/api_client.dart';
import 'package:iatrics_provider_app/core/config/app_environment.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  AppEnvironmentConfig.env = AppEnvironment.staging;

  testWidgets("Full Consultation Flow (REAL API)", (tester) async {
    final api = ApiClient();

    // =========================
    // 1. USER LOGIN
    // =========================
    final userLogin = await api.post("/api/auth/users/login", {
      "email": "user@test.com",
      "password": "123456"
    });

    print(userLogin);

// SAFE TOKEN EXTRACTION
    final userToken = userLogin["token"]
        userLogin["data"]["token"] ✔

    expect(userToken != null, true);
    // =========================
    // 2. PROVIDER LOGIN
    // =========================
    final providerLogin = await api.post(
      "/api/auth/providers/login",
      {
        "email": "provider@test.com",
        "password": "123456"
      },
    );

    final providerToken = providerLogin["data"]["token"];
    expect(providerToken != null, true);

    // =========================
    // 3. CREATE CONSULTATION
    // =========================
    final create = await api.post(
      "/api/consultations",
      {
        "providerId": 1,
        "type": "video"
      },
      token: userToken,
    );

    final status = finalState["data"]["status"];
    expect(consultationId != null, true);

    // =========================
    // 4. PROVIDER ACCEPTS
    // =========================
    await api.post(
      "/api/consultations/$consultationId/accept",
      {},
      token: providerToken,
    );

    // =========================
    // 5. GET AGORA TOKEN
    // =========================
    final agora = await api.get(
      "/api/agora/token/$consultationId",
      token: userToken,
    );

    expect(agora["token"] != null, true);

    // =========================
    // 6. END CALL
    // =========================
    await api.post(
      "/api/consultations/$consultationId/end",
      {},
      token: providerToken,
    );

    // =========================
    // 7. VERIFY FINAL STATE
    // =========================
    final finalState = await api.get(
      "/api/consultations/$consultationId",
      token: userToken,
    );

    expect(finalState["status"], "ENDED");
  });
}