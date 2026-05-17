import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:iatrics_provider_app/services/onboarding_service.dart';

void main() {
  group('OnboardingService', () {
    test('submits profile step and parses provider', () async {
      final service = OnboardingService(
        baseUrl: 'http://localhost:5002',
        client: MockClient((request) async {
          expect(request.method, 'POST');
          expect(request.url.path, '/api/providers/1/onboarding/profile');
          expect(request.headers['Authorization'], 'Bearer token');
          expect(request.body, contains('"specialty":"Cardiology"'));

          return http.Response(
            '{"success":true,"provider":{"id":1,"specialty":"Cardiology","licenseNumber":"LIC-1","yearsOfExperience":7,"onboardingStep":"PROFILE_COMPLETED","isApproved":false}}',
            200,
          );
        }),
      );

      final provider = await service.submitProfile(
        providerId: 1,
        token: 'token',
        specialty: 'Cardiology',
        licenseNumber: 'LIC-1',
        yearsOfExperience: 7,
      );

      expect(provider.id, 1);
      expect(provider.specialty, 'Cardiology');
      expect(provider.onboardingStep, 'PROFILE_COMPLETED');
    });

    test('throws readable errors for failed steps', () async {
      final service = OnboardingService(
        baseUrl: 'http://localhost:5002',
        client: MockClient((request) async {
          return http.Response('{"error":"Provider not found"}', 404);
        }),
      );

      expect(
        () => service.getStatus(providerId: 99, token: 'token'),
        throwsA(isA<Exception>()),
      );
    });
  });
}
