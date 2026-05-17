import '../core/network/api_client.dart';

class PaymentService {
  final ApiClient api = ApiClient();

  Future<dynamic> pay({
    required int amount,
    required String token,
  }) async {
    return await api.post(
      '/payments/pay',
      {
        'amount': amount,
        'token': token,
      },
    );
  }
}
