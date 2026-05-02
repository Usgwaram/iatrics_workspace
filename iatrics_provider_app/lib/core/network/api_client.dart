import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/app_environment.dart';

class ApiClient {
  final String baseUrl = AppEnvironmentConfig.baseUrl;

  // =========================
  // POST
  // =========================
  Future<dynamic> post(
      String path,
      Map<String, dynamic> body, {
        String? token,
      }) async {
    final url = Uri.parse("$baseUrl$path");

    try {
      final res = await http
          .post(
        url,
        headers: _headers(token),
        body: jsonEncode(body),
      )
          .timeout(const Duration(seconds: 15));

      return _handleResponse(res);
    } catch (e) {
      throw Exception("NETWORK_ERROR: $e");
    }
  }

  // =========================
  // GET
  // =========================
  Future<dynamic> get(
      String path, {
        String? token,
      }) async {
    final url = Uri.parse("$baseUrl$path");

    try {
      final res = await http
          .get(
        url,
        headers: _headers(token),
      )
          .timeout(const Duration(seconds: 15));

      return _handleResponse(res);
    } catch (e) {
      throw Exception("NETWORK_ERROR: $e");
    }
  }

  // =========================
  // HEADERS (STANDARDIZED)
  // =========================
  Map<String, String> _headers(String? token) {
    return {
      "Content-Type": "application/json",
      "Accept": "application/json",
      if (token != null) "Authorization": "Bearer $token",
    };
  }

  // =========================
  // RESPONSE HANDLER (PRODUCTION SAFE)
  // =========================
  static dynamic _handleResponse(http.Response res) {
    dynamic decoded;

    try {
      decoded = jsonDecode(res.body);
    } catch (_) {
      throw Exception("INVALID_JSON_RESPONSE: ${res.body}");
    }

    // Handle success format
    if (res.statusCode >= 200 && res.statusCode < 300) {
      return decoded;
    }

    // Handle structured backend errors
    final message = decoded is Map
        ? (decoded['message'] ??
        decoded['error']?['message'] ??
        'API_ERROR')
        : 'API_ERROR';

    final code = decoded is Map
        ? (decoded['error']?['code'] ?? 'UNKNOWN_ERROR')
        : 'UNKNOWN_ERROR';

    throw Exception("$code: $message");
  }
}