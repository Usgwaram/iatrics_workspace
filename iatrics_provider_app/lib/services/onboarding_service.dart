import 'dart:convert';

import 'package:http/http.dart' as http;

import '../models/provider_model.dart';
import '../utils/network_config.dart';

class OnboardingService {
  final http.Client _client;
  final String baseUrl;

  OnboardingService({
    http.Client? client,
    String? baseUrl,
  })  : _client = client ?? http.Client(),
        baseUrl = baseUrl ?? NetworkConfig.baseUrl;

  Future<ProviderModel> getStatus({
    required int providerId,
    required String token,
  }) async {
    final body = await _get(
      '/api/providers/$providerId/onboarding/status',
      token,
    );

    return ProviderModel.fromJson(body['provider']);
  }

  Future<ProviderModel> submitProfile({
    required int providerId,
    required String token,
    required String specialty,
    required String licenseNumber,
    required int yearsOfExperience,
    List<String> languages = const ['English'],
  }) async {
    final body = await _post(
      '/api/providers/$providerId/onboarding/profile',
      token,
      {
        'specialty': specialty,
        'licenseNumber': licenseNumber,
        'yearsOfExperience': yearsOfExperience,
        'languages': languages,
      },
    );

    return ProviderModel.fromJson(body['provider']);
  }

  Future<ProviderModel> submitDocuments({
    required int providerId,
    required String token,
    String? licenseDocumentUrl,
  }) async {
    final body = await _post(
      '/api/providers/$providerId/onboarding/documents',
      token,
      {
        if (licenseDocumentUrl != null)
          'licenseDocumentUrl': licenseDocumentUrl,
      },
    );

    return ProviderModel.fromJson(body['provider']);
  }

  Future<ProviderModel> submitBankSetup({
    required int providerId,
    required String token,
    required String bankCode,
    required String accountNumber,
    required String accountName,
  }) async {
    final body = await _post(
      '/api/providers/$providerId/onboarding/bank',
      token,
      {
        'bankCode': bankCode,
        'accountNumber': accountNumber,
        'accountName': accountName,
      },
    );

    return ProviderModel.fromJson(body['provider']);
  }

  Future<Map<String, dynamic>> _get(String path, String token) async {
    final response = await _client
        .get(
          Uri.parse('$baseUrl$path'),
          headers: _headers(token),
        )
        .timeout(const Duration(seconds: 8));

    return _decode(response);
  }

  Future<Map<String, dynamic>> _post(
    String path,
    String token,
    Map<String, dynamic> payload,
  ) async {
    final response = await _client
        .post(
          Uri.parse('$baseUrl$path'),
          headers: _headers(token),
          body: jsonEncode(payload),
        )
        .timeout(const Duration(seconds: 12));

    return _decode(response);
  }

  Map<String, String> _headers(String token) {
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    };
  }

  Map<String, dynamic> _decode(http.Response response) {
    final body = jsonDecode(response.body) as Map<String, dynamic>;

    if (response.statusCode >= 400) {
      throw Exception(body['error'] ?? body['message'] ?? 'Onboarding failed');
    }

    return body;
  }
}
