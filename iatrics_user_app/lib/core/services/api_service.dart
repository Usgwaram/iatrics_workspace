import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../utils/network_config.dart';

class ApiService {
  final http.Client _client;
  final String baseUrl;

  ApiService({http.Client? client, String? baseUrl})
      : _client = client ?? http.Client(),
        baseUrl = baseUrl ?? "${NetworkConfig.baseUrl}/api";

  Future<dynamic> post(String endpoint, Map data) async {
    final res = await _client.post(
      Uri.parse("$baseUrl/$endpoint"),
      headers: {"Content-Type": "application/json"},
      body: jsonEncode(data),
    );

    return jsonDecode(res.body);
  }

  Future<dynamic> get(String endpoint) async {
    final res = await _client.get(Uri.parse("$baseUrl/$endpoint"));
    return jsonDecode(res.body);
  }
}
