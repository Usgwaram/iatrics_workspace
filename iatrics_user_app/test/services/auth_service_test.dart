import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:iatrics_user_app/core/services/api_service.dart';
import 'package:iatrics_user_app/core/services/auth_service.dart';

void main() {
  group('AuthService', () {
    test('login posts credentials to auth endpoint', () async {
      final service = AuthService(
        api: ApiService(
          client: MockClient((request) async {
            expect(request.url.path, '/api/auth/login');
            expect(request.body, contains('"password":"Password123!"'));

            return http.Response('{"token":"login-token"}', 200);
          }),
        ),
      );

      final result = await service.login(
        email: 'user@test.com',
        password: 'Password123!',
      );

      expect(result['token'], 'login-token');
    });

    test('register posts new user payload to register endpoint', () async {
      final service = AuthService(
        api: ApiService(
          client: MockClient((request) async {
            expect(request.url.path, '/api/auth/register');
            expect(request.body, contains('"name":"Test User"'));

            return http.Response('{"success":true}', 201);
          }),
        ),
      );

      final result = await service.register(
        name: 'Test User',
        email: 'user@test.com',
        password: 'Password123!',
      );

      expect(result['success'], isTrue);
    });
  });
}
