import 'dart:convert';
import 'package:iatrics_provider_app/core/network/api_client.dart';

class WalletRepository {
  final ApiClient api;

  WalletRepository(this.api);

  Future<double> getBalance() async {
    final response = await api.get('/wallet');

    return jsonDecode(response.body);
  }
}
