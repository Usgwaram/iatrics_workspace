import 'package:flutter/material.dart';
import '../../core/services/auth_service.dart';

class AuthController extends ChangeNotifier {
  final AuthService _authService = AuthService();

  String? token;
  Map<String, dynamic>? provider;

  bool get isLoggedIn => token != null;

  // 🔥 INIT
  Future<void> init() async {
    // TODO: load token from secure storage later
    notifyListeners();
  }

  // 🔐 LOGIN
  Future<bool> login(String email, String password) async {
    try {
      final response = await api.post("/api/auth/login", {
        "email": email,
        "password": password,
      });
      if (response['token'] != null) {
        token = response['token'];
        provider = response['provider'];

        notifyListeners();
        return true;
      }

      return false;
    } catch (e) {
      debugPrint("Login error: $e");
      return false;
    }
  }

  // 👤 GET PROVIDER ID
  String? get providerId => provider?['id']?.toString();

  // 🧭 HOME ROUTING
  Widget resolveHome() {
    if (isLoggedIn) {
      return const Scaffold(
        body: Center(child: Text("Provider Dashboard")),
      );
    } else {
      return const Scaffold(
        body: Center(child: Text("Login Screen")),
      );
    }
  }
}