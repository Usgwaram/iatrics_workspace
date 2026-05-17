import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../utils/network_config.dart';

class ApiClient {
  final String baseUrl;

  ApiClient({String? baseUrl}) : baseUrl = baseUrl ?? NetworkConfig.baseUrl;

  Future<dynamic> login({
    required String email,
    required String password,
  }) async {
    return {
      "token": "demo-token",
      "provider": {
        "id": 1,
      }
    };
  }

  Future<http.Response> get(
    String endpoint,
  ) async {
    return http.get(
      Uri.parse("$baseUrl$endpoint"),
    );
  }

  Future<http.Response> post(
    String endpoint,
    Map<String, dynamic> body,
  ) async {
    return http.post(
      Uri.parse("$baseUrl$endpoint"),
      headers: {
        "Content-Type": "application/json",
      },
      body: jsonEncode(body),
    );
  }

  // TEST HELPERS

  Future<void> loginTest() async {}

  Future<dynamic> createProvider() async {}

  Future<dynamic> getWallet() async {}

  Future<dynamic> createConsultation() async {}

  Future<dynamic> getConsultations() async {}
}
