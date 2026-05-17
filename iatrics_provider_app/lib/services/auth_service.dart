import 'dart:convert';

import 'package:http/http.dart' as http;
import '../utils/network_config.dart';

class AuthService {
  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    final response = await http.post(
      Uri.parse("$baseUrl/api/auth/login"),
      headers: {
        "Content-Type": "application/json",
      },
      body: jsonEncode({
        "email": email,
        "password": password,
      }),
    );

    final data = jsonDecode(response.body);

    if (response.statusCode != 200) {
      throw Exception(data.toString());
    }

    return {
      "token": data["data"]["token"],
      "provider": data["data"]["provider"],
    };
  }

  String get baseUrl => NetworkConfig.baseUrl;
}
