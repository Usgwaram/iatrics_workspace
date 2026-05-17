import 'package:flutter_test/flutter_test.dart';
import 'package:iatrics_provider_app/core/network/api_client.dart';

void main() {
  group('ApiClient', () {
    test('login returns demo provider session', () async {
      final client = ApiClient();

      final result = await client.login(
        email: 'provider@test.com',
        password: 'Password123!',
      );

      expect(result['token'], 'demo-token');
      expect(result['provider']['id'], 1);
    });
  });
}
