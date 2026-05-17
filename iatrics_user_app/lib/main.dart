import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'features/auth/auth_controller.dart';
import 'features/auth/screens/login_screen.dart';
import 'features/home/user_dashboard_screen.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  final bool connectSocket;

  const MyApp({
    super.key,
    this.connectSocket = true,
  });

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => AuthController(connectSocket: connectSocket),
      child: MaterialApp(
        debugShowCheckedModeBanner: false,
        title: 'Iatrics User',
        home: Consumer<AuthController>(
          builder: (_, auth, __) {
            if (auth.isLoggedIn) {
              return UserDashboardScreen(
                userId: auth.userId ?? "",
              );
            }

            return const LoginScreen();
          },
        ),
      ),
    );
  }
}
