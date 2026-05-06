import 'dart:convert';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;

void main() {
  const String baseUrl = "https://iatrics-workspace.onrender.com";

  late String token;

  test("🔐 Login → Get Token", () async {
    final response = await http.post(
      Uri.parse("$baseUrl/api/auth/login"),
      headers: {"Content-Type": "application/json"},
      body: jsonEncode({
        "email": "user@test.com",
        "password": "123456"
      }),
    );

    print("LOGIN STATUS: ${response.statusCode}");
    print("LOGIN BODY: ${response.body}");

    expect(response.statusCode, 200);

    final data = jsonDecode(response.body);

    token = data["token"];
    expect(token.isNotEmpty, true);
  });

  test("📡 Access Protected Route (/wallet)", () async {
    final response = await http.get(
      Uri.parse("$baseUrl/api/wallet"),
      headers: {
        "Authorization": "Bearer $token",
        "Content-Type": "application/json"
      },
    );

    print("WALLET STATUS: ${response.statusCode}");
    print("WALLET BODY: ${response.body}");

    expect(response.statusCode, 200);
  });

  test("📞 Create Consultation", () async {
    final response = await http.post(
      Uri.parse("$baseUrl/api/consultations"),
      headers: {
        "Authorization": "Bearer $token",
        "Content-Type": "application/json"
      },
      body: jsonEncode({
        "providerId": 1,
        "type": "video"
      }),
    );

    print("CREATE CONSULT STATUS: ${response.statusCode}");
    print("CREATE CONSULT BODY: ${response.body}");

    expect(response.statusCode, 200);
  });

  test("📋 Get Consultations", () async {
    final response = await http.get(
      Uri.parse("$baseUrl/api/consultations"),
      headers: {
        "Authorization": "Bearer $token",
        "Content-Type": "application/json"
      },
    );

    print("GET CONSULT STATUS: ${response.statusCode}");
    print("GET CONSULT BODY: ${response.body}");

    expect(response.statusCode, 200);
  });
}