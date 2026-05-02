import 'package:flutter/material.dart';
import '../../models/provider_model.dart';
import 'onboarding_flow.dart';

class OnboardingShell extends StatelessWidget {
  final ProviderModel provider;

  const OnboardingShell({super.key, required this.provider});

  @override
  Widget build(BuildContext context) {
    return resolveOnboarding(provider);
  }
}