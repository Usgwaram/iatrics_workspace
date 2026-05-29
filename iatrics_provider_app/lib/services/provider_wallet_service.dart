import 'dart:convert';

import 'package:http/http.dart' as http;

import '../utils/network_config.dart';

class ProviderWalletService {
  final http.Client _client;
  final String baseUrl;

  ProviderWalletService({
    http.Client? client,
    String? baseUrl,
  })  : _client = client ?? http.Client(),
        baseUrl = baseUrl ?? NetworkConfig.baseUrl;

  Future<double> getBalance(String token) async {
    final body = await _get('/api/wallet/balance', token);
    return (body['balance'] as num?)?.toDouble() ?? 0;
  }

  Future<List<Map<String, dynamic>>> getTransactions(String token) async {
    final body = await _get('/api/wallet/transactions', token);
    final transactions = body['transactions'] as List? ?? [];
    return transactions.cast<Map<String, dynamic>>();
  }

  Future<Map<String, dynamic>> requestWithdrawal({
    required String token,
    required double amount,
    required String bankCode,
    required String accountNumber,
    required String accountName,
  }) {
    return _post('/api/withdrawals/request', token, {
      'amount': amount,
      'bankCode': bankCode,
      'accountNumber': accountNumber,
      'accountName': accountName,
    });
  }

  Future<Map<String, dynamic>> _get(String path, String token) async {
    final response = await _client.get(
      Uri.parse('$baseUrl$path'),
      headers: _headers(token),
    );

    return _decode(response);
  }

  Future<Map<String, dynamic>> _post(
    String path,
    String token,
    Map<String, dynamic> payload,
  ) async {
    final response = await _client.post(
      Uri.parse('$baseUrl$path'),
      headers: _headers(token),
      body: jsonEncode(payload),
    );

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
      throw Exception(
        body['error'] ?? body['message'] ?? 'Wallet request failed',
      );
    }

    return body;
  }
}
