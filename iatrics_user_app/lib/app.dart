import 'package:flutter/material.dart';
import 'core/services/socket_service.dart';
import 'core/services/call_service.dart';
import 'features/auth/services/auth_service.dart';
import 'features/auth/screens/login_screen.dart';
import 'features/home/user_dashboard_screen.dart';

class MyApp extends StatefulWidget {
  final GlobalKey<NavigatorState> navigatorKey;

  const MyApp({super.key, required this.navigatorKey});

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  final socketService = SocketService();
  final callService = CallService();

  @override
  void initState() {
    super.initState();

    socketService.connect();

    callService.initialize(
      socketInstance: socketService,
      navKey: widget.navigatorKey,
    );
  }

  @override
  Widget build(BuildContext context) {
    final isLoggedIn = AuthService().isLoggedIn;

    return MaterialApp(
      navigatorKey: widget.navigatorKey,
      debugShowCheckedModeBanner: false,
      home: isLoggedIn
          ? UserDashboardScreen(userId: AuthService().userId!)
          : const LoginScreen(),
    );
  }
}