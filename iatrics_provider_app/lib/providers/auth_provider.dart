import 'package:flutter/material.dart';
import '../models/provider_model.dart';

class AuthProvider extends ChangeNotifier {
  String? token;
  ProviderModel? provider;

  void setAuth(String newToken, ProviderModel newProvider) {
    token = newToken;
    provider = newProvider;
    notifyListeners();
  }

  void logout() {
    token = null;
    provider = null;
    notifyListeners();
  }
}
