import 'package:flutter_test/flutter_test.dart';
import 'package:iatrics_provider_app/core/network/mock_api_client.dart';

void main() {
  group('MockApiClient', () {
    test('returns provider login payload', () async {
      final result = await MockApiClient.post(
        '/api/auth/login',
        {
          'email': 'testprovider@mail.com',
          'password': '123456',
        },
      );

      expect(result['token'], 'mock_token_123');
      expect(result['provider'], isA<Map<String, dynamic>>());
      expect(result['provider']['id'], 1);
    });

    test('returns consultation payload', () async {
      final result = await MockApiClient.post(
        '/api/consultations',
        {
          'providerId': 1,
          'symptoms': 'Fever',
        },
      );

      expect(result['id'], 101);
      expect(result['status'], 'PENDING');
    });

    test('returns agora token and active consultation state', () async {
      final tokenResult = await MockApiClient.get('/api/agora/token');
      final consultationResult =
          await MockApiClient.get('/api/consultations/1');

      expect(tokenResult['token'], 'mock_agora_token');
      expect(consultationResult['status'], 'IN_CALL');
    });
  });
}
