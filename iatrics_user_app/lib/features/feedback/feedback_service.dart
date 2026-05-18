import 'dart:convert';

import 'package:http/http.dart' as http;

import '../../utils/auth_token.dart';
import '../../utils/network_config.dart';

class FeedbackService {
  final http.Client _client;
  final String baseUrl;

  FeedbackService({
    http.Client? client,
    String? baseUrl,
  })  : _client = client ?? http.Client(),
        baseUrl = baseUrl ?? NetworkConfig.baseUrl;

  Future<void> createReview({
    required int providerId,
    required int rating,
    required String comment,
  }) async {
    await _post('/api/feedback/reviews', {
      'providerId': providerId,
      'rating': rating,
      'comment': comment,
    });
  }

  Future<void> createComplaint({
    required int consultationId,
    required String category,
    required String message,
  }) async {
    await _post('/api/feedback/complaints', {
      'consultationId': consultationId,
      'category': category,
      'message': message,
    });
  }

  Future<List<Map<String, dynamic>>> getComplaints() async {
    final token = await AuthToken.getToken();
    if (token == null || token.isEmpty) throw Exception('Please log in again');

    final response = await _client.get(
      Uri.parse('$baseUrl/api/feedback/complaints'),
      headers: {'Authorization': 'Bearer $token'},
    );
    final body = _decode(response);
    final data = body['data'] as List? ?? [];

    return data.cast<Map>().map((item) {
      return Map<String, dynamic>.from(item);
    }).toList();
  }

  Future<void> _post(String path, Map<String, dynamic> payload) async {
    final token = await AuthToken.getToken();
    if (token == null || token.isEmpty) throw Exception('Please log in again');

    final response = await _client.post(
      Uri.parse('$baseUrl$path'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode(payload),
    );
    _decode(response);
  }

  Map<String, dynamic> _decode(http.Response response) {
    final body = jsonDecode(response.body) as Map<String, dynamic>;

    if (response.statusCode >= 400) {
      throw Exception(body['message'] ?? body['error'] ?? 'Request failed');
    }

    return body;
  }
}
