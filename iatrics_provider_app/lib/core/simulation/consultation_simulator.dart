import 'dart:async';
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/app_environment.dart';

class ConsultationSimulator {
  static final _controller = StreamController<String>.broadcast();
  static Stream<String> get stream => _controller.stream;

  static String get baseUrl => AppEnvironmentConfig.baseUrl;

  // =========================
  // 🚀 MAIN FLOW
  // =========================
  static Future<void> startFlow() async {
    try {
      print("🔐 USER LOGIN");

      final userLogin = await _post(
          "/api/auth/login", {"email": "user@test.com", "password": "123456"});

      final userToken = userLogin["token"];

      print("👨‍⚕️ PROVIDER LOGIN");

      final providerLogin = await _post("/api/auth/login",
          {"email": "provider@test.com", "password": "123456"});

      final providerToken = providerLogin["token"];

      print("📞 CREATE CONSULTATION");

      final createRes = await _post(
        "/api/consultations",
        {"providerId": "1", "type": "video"},
        token: userToken,
      );

      final consultationId = createRes["id"];

      _emit("CONSULTATION_CREATED");

      print("✅ PROVIDER ACCEPT");

      await _post(
        "/api/consultations/$consultationId/accept",
        {},
        token: providerToken,
      );

      _emit("IN_CALL");

      print("🎥 FETCH AGORA TOKENS");

      await _get("/api/agora/token/$consultationId", token: userToken);
      await _get("/api/agora/token/$consultationId", token: providerToken);

      print("🔚 END CALL");

      await _post(
        "/api/consultations/$consultationId/end",
        {},
        token: providerToken,
      );

      _emit("CALL_ENDED");

      print("✅ FLOW COMPLETED");
    } catch (e) {
      print("❌ SIMULATION ERROR: $e");
      _emit("ERROR");
      rethrow;
    }
  }

  // =========================
  // ⏳ WAIT HANDLER
  // =========================
  static Future<void> waitForCompletion({
    Duration timeout = const Duration(seconds: 15),
  }) async {
    await Future.delayed(timeout);
  }

  // =========================
  // 🌐 HTTP HELPERS
  // =========================
  static Future<Map<String, dynamic>> _post(
    String path,
    Map<String, dynamic> body, {
    String? token,
  }) async {
    final res = await http.post(
      Uri.parse("$baseUrl$path"),
      headers: {
        "Content-Type": "application/json",
        if (token != null) "Authorization": "Bearer $token",
      },
      body: jsonEncode(body),
    );

    _validate(res, path);

    return jsonDecode(res.body);
  }

  static Future<Map<String, dynamic>> _get(
    String path, {
    String? token,
  }) async {
    final res = await http.get(
      Uri.parse("$baseUrl$path"),
      headers: {
        if (token != null) "Authorization": "Bearer $token",
      },
    );

    _validate(res, path);

    return jsonDecode(res.body);
  }

  // =========================
  // 🔒 RESPONSE VALIDATION
  // =========================
  static void _validate(http.Response res, String path) {
    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw Exception(
        "API FAILED [$path]: ${res.statusCode} → ${res.body}",
      );
    }
  }

  // =========================
  // 📡 EVENT EMITTER
  // =========================
  static void _emit(String event) {
    _controller.add(event);
  }
}
