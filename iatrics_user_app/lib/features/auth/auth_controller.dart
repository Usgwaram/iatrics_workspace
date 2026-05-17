import 'package:flutter/material.dart';

import '../../core/services/socket_service.dart';
import '../../utils/auth_token.dart';
import '../../utils/network_config.dart';

class AuthController extends ChangeNotifier {
  bool isLoggedIn = false;
  bool isLoading = false;

  String? token;
  String? userId;

  final bool connectSocket;

  AuthController({this.connectSocket = true}) {
    restoreSession();
  }

  // RESTORE SAVED SESSION
  Future<void> restoreSession() async {
    token = await AuthToken.getToken();
    userId = await AuthToken.getUserId();

    if (token != null && userId != null) {
      isLoggedIn = true;

      if (connectSocket) {
        SocketService.instance.connect(
          baseUrl: NetworkConfig.baseUrl,
          token: token!,
        );
      }
    }

    notifyListeners();
  }

  // LOGIN
  Future<bool> login({
    required String email,
    required String password,
  }) async {
    try {
      isLoading = true;
      notifyListeners();

      // TEMP MOCK LOGIN
      await Future.delayed(
        const Duration(seconds: 1),
      );

      token = "demo_token";
      userId = "1";

      await AuthToken.saveToken(token!);
      await AuthToken.saveUserId(userId!);

      isLoggedIn = true;

      // CONNECT SOCKET AFTER LOGIN
      if (connectSocket) {
        SocketService.instance.connect(
          baseUrl: NetworkConfig.baseUrl,
          token: token!,
        );
      }

      isLoading = false;
      notifyListeners();

      return true;
    } catch (e) {
      isLoading = false;
      notifyListeners();

      return false;
    }
  }

  // LOGOUT
  Future<void> logout() async {
    await AuthToken.clear();

    SocketService.instance.disconnect();

    token = null;
    userId = null;
    isLoggedIn = false;

    notifyListeners();
  }
}
