import 'package:flutter/material.dart';

import '../../models/provider_model.dart';

class AuthController extends ChangeNotifier {
  bool isLoading = false;
  bool isLoggedIn = false;

  String? token;

  ProviderModel? provider;

  Future<void> login({
    required String email,
    required String password,
  }) async {
    isLoading = true;
    notifyListeners();

    await Future.delayed(
      const Duration(seconds: 1),
    );

    token = "test_provider_token";

    provider = ProviderModel(
      id: 2,
      fullName: "Test Provider",
      email: email,
      onboardingStep: "REGISTERED",
      isApproved: false,
    );

    isLoggedIn = true;

    isLoading = false;
    notifyListeners();
  }

  void logout() {
    token = null;
    provider = null;
    isLoggedIn = false;

    notifyListeners();
  }
}
