// lib/app_startup.dart

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'features/auth/auth_controller.dart';
import 'features/auth/login_screen.dart';

class AppStartup extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Consumer<AuthController>(
      builder: (context, auth, _) {

        if (auth.isLoading) {
          return const Scaffold(
            body: Center(child: CircularProgressIndicator()),
          );
        }

        if (auth.token == null) {
          return LoginScreen();
        }

        return auth.resolveHome();
      },
    );
  }
}