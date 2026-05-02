import 'api_service.dart';

class AuthService {
  final ApiService api = ApiService();

  Future login(String userId) async {
    return await api.post("auth/login", {"userId": userId});
  }

  Future register(Map data) async {
    return await api.post("auth/register", data);
  }
}