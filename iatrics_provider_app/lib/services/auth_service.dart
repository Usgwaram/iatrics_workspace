import 'dart:convert';

import 'package:http/http.dart' as http;
import '../models/provider_model.dart';
import '../utils/network_config.dart';

class AuthService {
  final http.Client _client;
  final String baseUrl;

  AuthService({
    http.Client? client,
    String? baseUrl,
  })  : _client = client ?? http.Client(),
        baseUrl = baseUrl ?? NetworkConfig.baseUrl;

  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    final response = await _client
        .post(
          Uri.parse("$baseUrl/api/auth/login"),
          headers: {
            "Content-Type": "application/json",
          },
          body: jsonEncode({
            "email": email,
            "password": password,
          }),
        )
        .timeout(const Duration(seconds: 15));

    final data = jsonDecode(response.body);

    if (response.statusCode != 200) {
      throw Exception(data["message"] ?? data.toString());
    }

    final token = data["token"] ?? data["data"]?["token"];
    final providerJson = data["provider"] ?? data["data"]?["provider"];
    final userJson = data["user"] ?? data["data"]?["user"];

    return {
      "token": token,
      "provider": providerJson ??
          {
            "id": userJson?["id"] ?? 0,
            "fullName": userJson?["fullName"] ?? "",
            "email": userJson?["email"] ?? email,
            "onboardingStep": "REGISTERED",
            "isApproved": false,
          },
    };
  }
}

class DemoAuthService extends AuthService {
  @override
  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    await Future.delayed(const Duration(seconds: 1));

    return {
      "token": "test_provider_token",
      "provider": ProviderModel(
        id: 2,
        fullName: "Test Provider",
        email: email,
        onboardingStep: "REGISTERED",
        isApproved: false,
      ),
    };
  }
}
