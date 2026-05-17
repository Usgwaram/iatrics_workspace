import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:iatrics_provider_app/features/onboarding/onboarding_controller.dart';
import 'package:iatrics_provider_app/services/onboarding_service.dart';

void main() {
  group('OnboardingController', () {
    test('moves provider through profile, document, and bank steps', () async {
      final service = OnboardingService(
        baseUrl: 'http://localhost:5002',
        client: MockClient((request) async {
          if (request.url.path.endsWith('/profile')) {
            return http.Response(
              '{"success":true,"provider":{"id":1,"onboardingStep":"PROFILE_COMPLETED","isApproved":false}}',
              200,
            );
          }

          if (request.url.path.endsWith('/documents')) {
            return http.Response(
              '{"success":true,"provider":{"id":1,"onboardingStep":"DOCUMENTS_SUBMITTED","isApproved":false}}',
              200,
            );
          }

          return http.Response(
            '{"success":true,"provider":{"id":1,"onboardingStep":"BANK_SETUP_DONE","isApproved":false}}',
            200,
          );
        }),
      );
      final controller = OnboardingController(service: service);

      await controller.submitProfile(
        providerId: 1,
        token: 'token',
        specialty: 'Cardiology',
        licenseNumber: 'LIC-1',
        yearsOfExperience: 7,
      );
      expect(controller.provider?.onboardingStep, 'PROFILE_COMPLETED');

      await controller.submitDocuments(providerId: 1, token: 'token');
      expect(controller.provider?.onboardingStep, 'DOCUMENTS_SUBMITTED');

      await controller.submitBankSetup(
        providerId: 1,
        token: 'token',
        bankCode: '044',
        accountNumber: '0123456789',
        accountName: 'Provider',
      );
      expect(controller.provider?.onboardingStep, 'BANK_SETUP_DONE');
      expect(controller.isLoading, isFalse);
      expect(controller.error, isNull);
    });
  });
}
