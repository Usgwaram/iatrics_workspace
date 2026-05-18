import 'dart:convert';

import 'package:http/http.dart' as http;

import '../../utils/auth_token.dart';
import '../../utils/network_config.dart';

class DoctorService {
  final http.Client _client;
  final String baseUrl;

  DoctorService({
    http.Client? client,
    String? baseUrl,
  })  : _client = client ?? http.Client(),
        baseUrl = baseUrl ?? NetworkConfig.baseUrl;

  Future<List<Map<String, dynamic>>> listDoctors({
    String? specialty,
    String? language,
    bool onlineOnly = false,
  }) async {
    final query = <String, String>{
      if (specialty != null && specialty.isNotEmpty) 'specialty': specialty,
      if (language != null && language.isNotEmpty) 'language': language,
      if (onlineOnly) 'online': 'true',
    };

    final uri = Uri.parse('$baseUrl/api/doctors').replace(
      queryParameters: query.isEmpty ? null : query,
    );
    final response = await _client.get(uri);
    final body = _decode(response);
    final data = body['data'] as List? ?? [];

    return data.cast<Map>().map((item) {
      return Map<String, dynamic>.from(item);
    }).toList();
  }

  Future<Map<String, dynamic>> getDoctorProfile(int id) async {
    final response = await _client.get(Uri.parse('$baseUrl/api/doctors/$id'));
    final body = _decode(response);
    return Map<String, dynamic>.from(body['data'] as Map);
  }

  Future<int> estimatePrice({
    required Map<String, dynamic> doctor,
    required String type,
  }) async {
    final response = await _client.post(
      Uri.parse('$baseUrl/api/pricing/estimate'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'specialty': doctor['specialty'],
        'yearsOfExperience': doctor['yearsOfExperience'] ?? 0,
        'type': type,
      }),
    );
    final body = _decode(response);
    return body['price'] as int;
  }

  Future<Map<String, dynamic>> createInstantConsultation({
    required int providerId,
    required String symptoms,
  }) async {
    return _authorizedPost('/api/consultations/instant', {
      'providerId': providerId,
      'symptoms': symptoms,
    });
  }

  Future<Map<String, dynamic>> createBookingConsultation({
    required int providerId,
    required String symptoms,
    required String appointmentDate,
    required String appointmentTime,
  }) async {
    return _authorizedPost('/api/consultations/booking', {
      'providerId': providerId,
      'symptoms': symptoms,
      'appointmentDate': appointmentDate,
      'appointmentTime': appointmentTime,
    });
  }

  Future<Map<String, dynamic>> _authorizedPost(
    String path,
    Map<String, dynamic> payload,
  ) async {
    final token = await AuthToken.getToken();

    if (token == null || token.isEmpty) {
      throw Exception('Please log in again');
    }

    final response = await _client.post(
      Uri.parse('$baseUrl$path'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode(payload),
    );

    return _decode(response);
  }

  Map<String, dynamic> _decode(http.Response response) {
    final body = jsonDecode(response.body) as Map<String, dynamic>;

    if (response.statusCode >= 400) {
      throw Exception(body['message'] ?? body['error'] ?? 'Request failed');
    }

    return body;
  }
}
