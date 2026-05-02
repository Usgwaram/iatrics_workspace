import 'package:flutter/material.dart';
import '../../models/provider_model.dart';

class OnboardingController extends ChangeNotifier {
  ProviderModel provider;

  OnboardingController(this.provider);

  void updateStep(String newStep) {
    provider = ProviderModel(
      id: provider.id,
      name: provider.name,
      email: provider.email,
      onboardingStep: newStep,
    );

    notifyListeners();
  }
}