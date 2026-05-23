import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:iatrics_provider_app/features/onboarding/onboarding_controller.dart';
import 'package:iatrics_provider_app/features/onboarding/onboarding_flow.dart';
import 'package:iatrics_provider_app/features/onboarding/steps/approval_waiting.dart';
import 'package:iatrics_provider_app/services/onboarding_service.dart';

void main() {
  testWidgets('provider completes onboarding screens in order', (tester) async {
    final service = OnboardingService(
      baseUrl: 'http://localhost:5002',
      client: MockClient((request) async {
        if (request.url.path.endsWith('/status')) {
          return http.Response(
            '{"success":true,"provider":{"id":1,"onboardingStep":"REGISTERED","isApproved":false}}',
            200,
          );
        }

        if (request.url.path.endsWith('/profile')) {
          return http.Response(
            '{"success":true,"provider":{"id":1,"specialty":"Cardiology","licenseNumber":"LIC-1","yearsOfExperience":7,"onboardingStep":"PROFILE_COMPLETED","isApproved":false}}',
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

    await tester.pumpWidget(
      MaterialApp(
        home: OnboardingFlow(
          providerId: 1,
          token: 'token',
          controller: controller,
        ),
      ),
    );

    await tester.pumpAndSettle();

    expect(find.text('Complete Profile'), findsOneWidget);

    await tester.enterText(
      find.widgetWithText(TextField, 'Specialty'),
      'Cardiology',
    );
    await tester.enterText(
      find.widgetWithText(TextField, 'License Number'),
      'LIC-1',
    );
    await tester.enterText(
      find.widgetWithText(TextField, 'Years Experience'),
      '7',
    );
    await tester.tap(find.text('Submit Profile'));
    await tester.pumpAndSettle();

    expect(find.text('Upload Documents'), findsOneWidget);

    await tester.tap(find.text('Submit Documents'));
    await tester.pumpAndSettle();

    expect(find.text('Bank Setup'), findsOneWidget);

    await tester.enterText(
      find.widgetWithText(TextField, 'Account Number'),
      '0123456789',
    );
    await tester.enterText(
      find.widgetWithText(TextField, 'Account Name'),
      'Provider',
    );
    await tester.tap(find.text('Complete Bank Setup'));
    await tester.pumpAndSettle();

    expect(find.byType(WaitingApprovalScreen), findsOneWidget);
    expect(find.text('Waiting for Admin Approval'), findsOneWidget);
  });
}
