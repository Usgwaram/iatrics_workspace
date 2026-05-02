import '../network/api_client.dart';

class AuthService {
  final ApiClient api = ApiClient();

  Future login(String email, String password) async {
    return await api.post("/api/auth/login", {
      "email": email,
      "password": password,
    });
  }
}

    return res;
  }

  Future<Map<String, dynamic>> register(Map<String, dynamic> data) async {
    final res = await api.post(
      "/api/providers/register",
      body: data,
    );

    return res;
  }
}