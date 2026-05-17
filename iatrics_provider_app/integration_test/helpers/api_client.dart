import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiClient {
  static const baseUrl = "https://iatrics-workspace.onrender.com";

  String? _token;

  void setToken(String token) {
    _token = token;
  }

  Map<String, String> get headers => {
        "Content-Type": "application/json",
        if (_token != null) "Authorization": "Bearer $_token",
      };

  Future<Map<String, dynamic>> post(String path, Map body) async {
    final res = await http.post(
      Uri.parse("$baseUrl$path"),
      headers: headers,
      body: jsonEncode(body),
    );

    if (res.statusCode >= 400) {
      throw Exception(res.body);
    }

    return jsonDecode(res.body);
  }

  Future<Map<String, dynamic>> get(String path) async {
    final res = await http.get(
      Uri.parse("$baseUrl$path"),
      headers: headers,
    );

    if (res.statusCode >= 400) {
      throw Exception(res.body);
    }

    return jsonDecode(res.body);
  }
}
