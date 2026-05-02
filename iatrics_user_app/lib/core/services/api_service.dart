import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  static const baseUrl = "http://YOUR_BACKEND_URL/api";

  Future<dynamic> post(String endpoint, Map data) async {
    final res = await http.post(
      Uri.parse("$baseUrl/$endpoint"),
      headers: {"Content-Type": "application/json"},
      body: jsonEncode(data),
    );

    return jsonDecode(res.body);
  }

  Future<dynamic> get(String endpoint) async {
    final res = await http.get(Uri.parse("$baseUrl/$endpoint"));
    return jsonDecode(res.body);
  }
}