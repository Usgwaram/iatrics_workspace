import 'package:flutter_test/flutter_test.dart';
import 'package:iatrics_user_app/features/auth/auth_controller.dart';
import 'package:iatrics_user_app/utils/auth_token.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  group('AuthController', () {
    setUp(() {
      SharedPreferences.setMockInitialValues({});
    });

    test('restoreSession keeps user logged out when no token is saved',
        () async {
      final controller = AuthController(connectSocket: false);

      await controller.restoreSession();

      expect(controller.isLoggedIn, isFalse);
      expect(controller.token, isNull);
      expect(controller.userId, isNull);
    });

    test('restoreSession loads saved token and user id', () async {
      await AuthToken.saveToken('saved-token');
      await AuthToken.saveUserId('42');

      final controller = AuthController(connectSocket: false);
      await controller.restoreSession();

      expect(controller.isLoggedIn, isTrue);
      expect(controller.token, 'saved-token');
      expect(controller.userId, '42');
    });

    test('login stores demo session and toggles loading state', () async {
      final controller = AuthController(connectSocket: false);
      final loadingStates = <bool>[];

      controller.addListener(() {
        loadingStates.add(controller.isLoading);
      });

      final success = await controller.login(
        email: 'user@test.com',
        password: 'Password123!',
      );

      expect(success, isTrue);
      expect(controller.isLoggedIn, isTrue);
      expect(controller.token, 'demo_token');
      expect(controller.userId, '1');
      expect(await AuthToken.getToken(), 'demo_token');
      expect(await AuthToken.getUserId(), '1');
      expect(loadingStates, containsAllInOrder([true, false]));
    });

    test('logout clears saved and in-memory session', () async {
      final controller = AuthController(connectSocket: false);

      await controller.login(
        email: 'user@test.com',
        password: 'Password123!',
      );
      await controller.logout();

      expect(controller.isLoggedIn, isFalse);
      expect(controller.token, isNull);
      expect(controller.userId, isNull);
      expect(await AuthToken.getToken(), isNull);
      expect(await AuthToken.getUserId(), isNull);
    });
  });
}
