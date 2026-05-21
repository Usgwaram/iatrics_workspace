import 'package:flutter_test/flutter_test.dart';
import 'package:iatrics_provider_app/features/auth/auth_controller.dart';
import 'package:iatrics_provider_app/services/auth_service.dart';

void main() {
  group('AuthController', () {
    test('login sets loading, token, provider, and notifies listeners',
        () async {
      final controller = AuthController(authService: DemoAuthService());
      var notifications = 0;
      final loadingStates = <bool>[];

      controller.addListener(() {
        notifications++;
        loadingStates.add(controller.isLoading);
      });

      final loginFuture = controller.login(
        email: 'provider@test.com',
        password: 'Password123!',
      );

      expect(controller.isLoading, isTrue);

      await loginFuture;

      expect(controller.isLoading, isFalse);
      expect(controller.isLoggedIn, isTrue);
      expect(controller.token, 'test_provider_token');
      expect(controller.provider?.fullName, 'Test Provider');
      expect(controller.provider?.email, 'provider@test.com');
      expect(notifications, greaterThanOrEqualTo(2));
      expect(loadingStates.first, isTrue);
      expect(loadingStates.last, isFalse);
    });

    test('logout clears authenticated state', () async {
      final controller = AuthController(authService: DemoAuthService());

      await controller.login(
        email: 'provider@test.com',
        password: 'Password123!',
      );

      controller.logout();

      expect(controller.isLoggedIn, isFalse);
      expect(controller.token, isNull);
      expect(controller.provider, isNull);
    });
  });
}
