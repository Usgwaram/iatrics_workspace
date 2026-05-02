import '../network/api_client.dart';

class PaymentService {
  final ApiClient api = ApiClient();

  Future makePayment(Map<String, dynamic> data, String token) async {
    return await api.post(
      "/api/payments",
      body: data,
      token: token,
    );
  }
}