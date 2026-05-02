import 'package:flutter/material.dart';
import 'core/services/socket_service.dart';
import 'core/services/call_service.dart';
import 'features/auth/screens/login_screen.dart';

final GlobalKey<NavigatorState> navKey = GlobalKey<NavigatorState>();

void main() {
  runApp(const MyApp());
}

class MyApp extends StatefulWidget {
  const MyApp({super.key});

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  final socket = SocketService();

  @override
  void initState() {
    super.initState();

    // Connect socket (replace with real userId)
    socket.connect("USER_ID", "USER");

    // Initialize call system
    CallService().initialize(
      socketInstance: socket,
      navigatorKey: navKey,
    );
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      navigatorKey: navKey,
      routes: {
        '/login': (_) => LoginScreen(),
      },
      home: LoginScreen(),
    );
  }
}