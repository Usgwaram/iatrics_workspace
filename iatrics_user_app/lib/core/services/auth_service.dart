import 'api_service.dart';

class AuthService {
  final ApiService api;

  AuthService({ApiService? api}) : api = api ?? ApiService();

  // =========================
  // LOGIN
  // =========================
  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    final response = await api.post(
      "auth/login",
      {
        "email": email,
        "password": password,
      },
    );

    return Map<String, dynamic>.from(response);
  }

  // =========================
  // REGISTER
  // =========================
  Future<Map<String, dynamic>> register({
    required String name,
    required String email,
    required String password,
  }) async {
    final response = await api.post(
      "auth/register",
      {
        "name": name,
        "email": email,
        "password": password,
      },
    );

    return Map<String, dynamic>.from(response);
  }
}
