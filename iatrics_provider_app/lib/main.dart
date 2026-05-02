import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'core/services/socket_service.dart';
import 'core/services/call_service.dart';
import 'features/auth/auth_controller.dart';

final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => AuthController()..init(),
      child: Consumer<AuthController>(
        builder: (context, auth, _) {
          if (auth.isLoggedIn && auth.providerId != null) {
            final socket = SocketService();
            socket.connect(auth.providerId!, "PROVIDER");

            CallService().init(
              socketInstance: socket,
              navigatorKey: navigatorKey,
            );
          }

          return MaterialApp(
            navigatorKey: navigatorKey,
            home: auth.resolveHome(),
          );
        },
      ),
    );
  }
}