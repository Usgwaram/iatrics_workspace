import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'features/auth/auth_controller.dart';
import 'features/auth/login_screen.dart';
import 'features/dashboard/provider_dashboard_screen.dart';
import 'features/onboarding/onboarding_flow.dart';

class AppStartup extends StatelessWidget {
  const AppStartup({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthController>(context);

    if (auth.isLoading) {
      return const Scaffold(
        body: Center(
          child: CircularProgressIndicator(),
        ),
      );
    }

    if (auth.isLoggedIn && auth.provider != null) {
      final provider = auth.provider!;

      if (!provider.isApproved && provider.onboardingStep != 'APPROVED') {
        return OnboardingFlow(
          providerId: provider.id,
          token: auth.token ?? '',
        );
      }

      return ProviderDashboardScreen(
        providerId: provider.id,
      );
    }

    return const LoginScreen();
  }
}
