import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:iatrics_provider_app/features/onboarding/onboarding_controller.dart';
import 'package:iatrics_provider_app/main.dart';
import 'package:iatrics_provider_app/services/onboarding_service.dart';
import 'package:integration_test/integration_test.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  OnboardingController onboardingController() {
    final service = OnboardingService(
      baseUrl: 'https://api.iatrics.ng',
      client: MockClient((request) async {
        return http.Response(
          '{"success":true,"provider":{"id":2,"onboardingStep":"REGISTERED","isApproved":false}}',
          200,
        );
      }),
    );

    return OnboardingController(service: service);
  }

  testWidgets('provider can log in and reach onboarding', (tester) async {
    await tester.pumpWidget(
      MyApp(
        enableExternalServices: false,
        onboardingController: onboardingController(),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Provider Login'), findsOneWidget);

    await tester.enterText(
      find.widgetWithText(TextField, 'Email'),
      'provider@test.com',
    );
    await tester.enterText(
      find.widgetWithText(TextField, 'Password'),
      'Password123!',
    );
    final loginButton = find.widgetWithText(ElevatedButton, 'Login');
    await tester.ensureVisible(loginButton);
    await tester.tap(loginButton, warnIfMissed: false);

    await tester.pump(const Duration(seconds: 1));
    await tester.pumpAndSettle();

    expect(find.text('Complete Profile'), findsOneWidget);
    expect(
        find.widgetWithText(ElevatedButton, 'Submit Profile'), findsOneWidget);
  });

  testWidgets('provider can open and complete registration screen',
      (tester) async {
    await tester.pumpWidget(const MyApp(enableExternalServices: false));
    await tester.pumpAndSettle();

    final createAccount =
        find.widgetWithText(TextButton, 'Create Provider Account');
    await tester.ensureVisible(createAccount);
    await tester.tap(createAccount, warnIfMissed: false);
    await tester.pumpAndSettle();

    expect(find.text('Register'), findsWidgets);
    expect(find.widgetWithText(ElevatedButton, 'Register'), findsOneWidget);
    expect(find.text('Name'), findsOneWidget);
    expect(find.text('Email'), findsOneWidget);
    expect(find.text('Password'), findsOneWidget);

    await tester.enterText(find.widgetWithText(TextField, 'Name'), 'Dr Test');
    await tester.enterText(
      find.widgetWithText(TextField, 'Email'),
      'provider@test.com',
    );
    await tester.enterText(
      find.widgetWithText(TextField, 'Password'),
      'Password123!',
    );
    final registerButton = find.widgetWithText(ElevatedButton, 'Register');
    await tester.ensureVisible(registerButton);
    await tester.tap(registerButton, warnIfMissed: false);
    await tester.pumpAndSettle();

    expect(find.text('Provider Login'), findsOneWidget);
  });
}
