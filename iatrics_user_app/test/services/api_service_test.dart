import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:iatrics_user_app/core/services/api_service.dart';

void main() {
  group('ApiService', () {
    test('post encodes request and decodes JSON response', () async {
      final service = ApiService(
        client: MockClient((request) async {
          expect(request.method, 'POST');
          expect(request.url.path, '/api/auth/login');
          expect(request.headers['Content-Type'], 'application/json');
          expect(request.body, contains('"email":"user@test.com"'));

          return http.Response('{"token":"abc","userId":"1"}', 200);
        }),
      );

      final result = await service.post(
        'auth/login',
        {'email': 'user@test.com', 'password': 'Password123!'},
      );

      expect(result['token'], 'abc');
      expect(result['userId'], '1');
    });

    test('get decodes JSON response', () async {
      final service = ApiService(
        client: MockClient((request) async {
          expect(request.method, 'GET');
          expect(request.url.path, '/api/users/1');

          return http.Response('{"id":1,"fullName":"Test User"}', 200);
        }),
      );

      final result = await service.get('users/1');

      expect(result['id'], 1);
      expect(result['fullName'], 'Test User');
    });
  });
}
