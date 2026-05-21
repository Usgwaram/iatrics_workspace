import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:iatrics_provider_app/features/auth/auth_controller.dart';
import 'package:iatrics_provider_app/features/auth/login_screen.dart';
import 'package:iatrics_provider_app/services/auth_service.dart';
import 'package:provider/provider.dart';

void main() {
  testWidgets('LoginScreen renders provider login form', (tester) async {
    await tester.pumpWidget(
      ChangeNotifierProvider(
        create: (_) => AuthController(authService: DemoAuthService()),
        child: const MaterialApp(
          home: LoginScreen(),
        ),
      ),
    );

    expect(find.text('Provider Login'), findsOneWidget);
    expect(find.byType(TextField), findsNWidgets(2));
    expect(find.text('Email'), findsOneWidget);
    expect(find.text('Password'), findsOneWidget);
    expect(find.text('Login'), findsOneWidget);
    expect(find.text('Create Provider Account'), findsOneWidget);
  });

  testWidgets('LoginScreen submits credentials and updates AuthController',
      (tester) async {
    final auth = AuthController(authService: DemoAuthService());

    await tester.pumpWidget(
      ChangeNotifierProvider.value(
        value: auth,
        child: const MaterialApp(
          home: LoginScreen(),
        ),
      ),
    );

    await tester.enterText(
      find.byType(TextField).first,
      'provider@test.com',
    );
    await tester.enterText(
      find.byType(TextField).last,
      'Password123!',
    );

    await tester.tap(find.text('Login'));
    await tester.pump();

    expect(find.byType(CircularProgressIndicator), findsOneWidget);

    await tester.pump(const Duration(seconds: 1));
    await tester.pump();

    expect(auth.isLoggedIn, isTrue);
    expect(auth.token, 'test_provider_token');
    expect(auth.provider?.email, 'provider@test.com');
    expect(find.text('Login successful'), findsOneWidget);
  });
}
