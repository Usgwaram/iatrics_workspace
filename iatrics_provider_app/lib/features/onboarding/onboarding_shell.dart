import 'package:flutter/material.dart';

import 'onboarding_flow.dart';

class OnboardingShell extends StatelessWidget {
  final int providerId;
  final String token;

  const OnboardingShell({
    super.key,
    required this.providerId,
    required this.token,
  });

  @override
  Widget build(BuildContext context) {
    return OnboardingFlow(
      providerId: providerId,
      token: token,
    );
  }
}
