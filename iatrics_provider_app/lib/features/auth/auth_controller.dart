import 'package:flutter/material.dart';

import '../../models/provider_model.dart';
import '../../services/auth_service.dart';

class AuthController extends ChangeNotifier {
  final AuthService authService;

  AuthController({
    AuthService? authService,
  }) : authService = authService ?? AuthService();

  bool isLoading = false;
  bool isLoggedIn = false;

  String? token;

  ProviderModel? provider;

  Future<void> login({
    required String email,
    required String password,
  }) async {
    try {
      isLoading = true;
      notifyListeners();

      final result = await authService.login(
        email: email,
        password: password,
      );

      token = result["token"]?.toString();
      final providerData = result["provider"];
      provider = providerData is ProviderModel
          ? providerData
          : ProviderModel.fromJson(
              Map<String, dynamic>.from(providerData as Map),
            );

      isLoggedIn = true;
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  void logout() {
    token = null;
    provider = null;
    isLoggedIn = false;

    notifyListeners();
  }
}
