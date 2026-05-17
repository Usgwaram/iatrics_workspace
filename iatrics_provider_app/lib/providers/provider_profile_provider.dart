import 'package:flutter/material.dart';

import '../../models/provider_model.dart';

class ProviderProfileProvider extends ChangeNotifier {
  ProviderModel? provider;

  void setProvider(ProviderModel p) {
    provider = p;
    notifyListeners();
  }

  void updateProfile({
    String? fullName,
    String? email,
  }) {
    if (provider == null) return;

    provider = provider!.copyWith(
      fullName: fullName,
      email: email,
    );

    notifyListeners();
  }

  void clearProvider() {
    provider = null;
    notifyListeners();
  }
}
