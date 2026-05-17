import 'dart:convert';
import 'package:http/http.dart' as http;
import '../utils/network_config.dart';

class ProviderEarningsService {
  static String get _baseUrl => NetworkConfig.baseUrl;

  static Future<Map<String, dynamic>> fetchEarnings(String providerId) async {
    final response = await http.get(
      Uri.parse("$_baseUrl/api/provider/earnings/$providerId"),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return {
        'totalEarnings': data['totalEarnings'],
        'consultations': data['consultations'],
      };
    } else {
      throw Exception("Failed to load earnings");
    }
  }
}
