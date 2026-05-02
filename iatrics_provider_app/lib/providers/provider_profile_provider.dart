import 'package:flutter/material.dart';
import '../models/provider_model.dart';

class ProviderProfileProvider extends ChangeNotifier {
  ProviderModel? provider;

  void setProvider(ProviderModel p) {
    provider = p;
    notifyListeners();
  }

  void updateOnboardingStep(String step) {
    if (provider == null) return;

    provider = ProviderModel(
      id: provider!.id,
      name: provider!.name,
      email: provider!.email,
      onboardingStep: step,
    );

    notifyListeners();
  }
}