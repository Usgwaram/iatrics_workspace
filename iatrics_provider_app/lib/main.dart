import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'features/auth/auth_controller.dart';
import 'features/auth/login_screen.dart';
import 'features/dashboard/provider_dashboard_screen.dart';
import 'features/onboarding/onboarding_controller.dart';
import 'features/onboarding/onboarding_flow.dart';

import 'app_root.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  final bool enableExternalServices;
  final OnboardingController? onboardingController;

  const MyApp({
    super.key,
    this.enableExternalServices = true,
    this.onboardingController,
  });

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => AuthController(),
      child: Consumer<AuthController>(
        builder: (context, auth, _) {
          final provider = auth.provider;
          final token = auth.token ?? '';
          final needsOnboarding = provider != null &&
              !provider.isApproved &&
              provider.onboardingStep != 'APPROVED';

          return MaterialApp(
            debugShowCheckedModeBanner: false,
            title: 'Iatrics Provider',
            theme: ThemeData(
              primarySwatch: Colors.blue,
            ),
            home: auth.isLoggedIn
                ? AppRoot(
                    userId: provider!.id.toString(),
                    enableExternalServices: enableExternalServices,
                    child: needsOnboarding
                        ? OnboardingFlow(
                            providerId: provider.id,
                            token: token,
                            controller: onboardingController,
                          )
                        : ProviderDashboardScreen(
                            providerId: provider.id,
                          ),
                  )
                : const LoginScreen(),
          );
        },
      ),
    );
  }
}
