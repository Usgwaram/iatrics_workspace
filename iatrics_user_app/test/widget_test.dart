import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:iatrics_user_app/features/consultation/consultation_detail_screen.dart';
import 'package:iatrics_user_app/features/consultation/incoming_call_screen.dart';
import 'package:iatrics_user_app/features/consultation/user_consultation_history.dart';
import 'package:iatrics_user_app/features/auth/auth_controller.dart';
import 'package:iatrics_user_app/features/auth/screens/login_screen.dart';
import 'package:iatrics_user_app/features/auth/screens/register_screen.dart';
import 'package:iatrics_user_app/features/home/user_dashboard_screen.dart';
import 'package:iatrics_user_app/features/payment/fund_wallet_screen.dart';
import 'package:iatrics_user_app/features/payment/user_wallet_screen.dart';
import 'package:iatrics_user_app/features/profile/user_register_screen.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  setUp(() {
    SharedPreferences.setMockInitialValues({});
  });

  testWidgets('LoginScreen renders user login flow', (tester) async {
    await tester.pumpWidget(
      ChangeNotifierProvider(
        create: (_) => AuthController(connectSocket: false),
        child: const MaterialApp(
          home: LoginScreen(),
        ),
      ),
    );

    expect(find.text('Login'), findsNWidgets(2));
    expect(find.text('User ID'), findsOneWidget);
    expect(find.text("Don't have an account? Register"), findsOneWidget);

    await tester.enterText(find.byType(TextField), '1');
    await tester.tap(find.widgetWithText(ElevatedButton, 'Login'));
    await tester.pump(const Duration(seconds: 1));
    await tester.pump();

    final auth =
        tester.element(find.byType(LoginScreen)).read<AuthController>();
    expect(auth.isLoggedIn, isTrue);
  });

  testWidgets('RegisterScreen renders fields and handles submit',
      (tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: RegisterScreen(),
      ),
    );

    expect(find.text('Register'), findsOneWidget);
    expect(find.text('Email'), findsOneWidget);
    expect(find.text('Password'), findsOneWidget);
    expect(find.text('Create Account'), findsOneWidget);

    await tester.tap(find.text('Create Account'));
    await tester.pump();

    expect(find.text('Register clicked (not connected yet)'), findsOneWidget);
  });

  testWidgets('UserDashboardScreen renders call action', (tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: UserDashboardScreen(userId: '1'),
      ),
    );

    expect(find.text('User Dashboard'), findsOneWidget);
    expect(find.text('Call Provider'), findsOneWidget);
  });

  testWidgets('UserWalletScreen shows balance and fund action', (tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: UserWalletScreen(),
      ),
    );

    expect(find.text('Wallet'), findsOneWidget);
    expect(find.text('Balance: ₦0.0'), findsOneWidget);
    expect(find.text('Fund Wallet'), findsOneWidget);

    await tester.tap(find.text('Fund Wallet'));
    await tester.pumpAndSettle();

    expect(find.byType(FundWalletScreen), findsOneWidget);
    expect(find.text('Open Payment Page'), findsOneWidget);
  });

  testWidgets('ConsultationDetailScreen shows passed consultation data',
      (tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: ConsultationDetailScreen(
          data: {
            'diagnosis': 'Malaria',
            'cost': 2500,
          },
        ),
      ),
    );

    expect(find.text('Consultation Detail'), findsOneWidget);
    expect(find.textContaining('Malaria'), findsOneWidget);
    expect(find.textContaining('2500'), findsOneWidget);
  });

  testWidgets('UserConsultationHistory loads consultations and opens detail',
      (tester) async {
    final client = MockClient((request) async {
      expect(request.url.path, '/api/consultations/user/1');

      return http.Response(
        '[{"diagnosis":"Migraine","cost":1500,"createdAt":"2026-05-15"}]',
        200,
      );
    });

    await tester.pumpWidget(
      MaterialApp(
        home: UserConsultationHistory(
          userId: '1',
          client: client,
        ),
      ),
    );

    expect(find.byType(CircularProgressIndicator), findsOneWidget);

    await tester.pumpAndSettle();

    expect(find.text('My Consultations'), findsOneWidget);
    expect(find.text('Migraine'), findsOneWidget);
    expect(find.textContaining('1500'), findsOneWidget);

    await tester.tap(find.text('Migraine'));
    await tester.pumpAndSettle();

    expect(find.byType(ConsultationDetailScreen), findsOneWidget);
    expect(find.textContaining('Migraine'), findsOneWidget);
  });

  testWidgets('UserConsultationHistory shows empty state', (tester) async {
    final client = MockClient((request) async {
      return http.Response('[]', 200);
    });

    await tester.pumpWidget(
      MaterialApp(
        home: UserConsultationHistory(
          userId: '1',
          client: client,
        ),
      ),
    );

    await tester.pumpAndSettle();

    expect(find.text('No consultations yet'), findsOneWidget);
  });

  testWidgets('IncomingCallScreen renders call controls', (tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: IncomingCallScreen(channelName: 'test-channel'),
      ),
    );

    expect(find.text('Incoming Call'), findsOneWidget);
    expect(find.text('Incoming Video Call...'), findsOneWidget);
    expect(find.byIcon(Icons.call), findsOneWidget);
    expect(find.byIcon(Icons.call_end), findsOneWidget);
  });

  testWidgets('UserRegisterScreen posts form and pops on success',
      (tester) async {
    final client = MockClient((request) async {
      expect(request.method, 'POST');
      expect(request.url.path, '/api/users/register');
      expect(request.body, contains('"name":"Test User"'));
      expect(request.body, contains('"phone":"08000000000"'));

      await Future<void>.delayed(const Duration(milliseconds: 50));

      return http.Response('{"success":true}', 201);
    });

    await tester.pumpWidget(
      MaterialApp(
        home: Builder(
          builder: (context) {
            return ElevatedButton(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => UserRegisterScreen(client: client),
                  ),
                );
              },
              child: const Text('Open Registration'),
            );
          },
        ),
      ),
    );

    await tester.tap(find.text('Open Registration'));
    await tester.pumpAndSettle();

    await tester.enterText(find.widgetWithText(TextField, 'Name'), 'Test User');
    await tester.enterText(
      find.widgetWithText(TextField, 'Email'),
      'user@test.com',
    );
    await tester.enterText(
      find.widgetWithText(TextField, 'Phone'),
      '08000000000',
    );
    await tester.enterText(
      find.widgetWithText(TextField, 'Password'),
      'Password123!',
    );

    await tester.tap(find.widgetWithText(ElevatedButton, 'Register'));
    await tester.pump();

    expect(find.text('Registering...'), findsOneWidget);

    await tester.pumpAndSettle();

    expect(find.text('Open Registration'), findsOneWidget);
    expect(find.byType(UserRegisterScreen), findsNothing);
  });

  testWidgets('UserRegisterScreen shows failure message', (tester) async {
    final client = MockClient((request) async {
      return http.Response('{"success":false}', 400);
    });

    await tester.pumpWidget(
      MaterialApp(
        home: UserRegisterScreen(client: client),
      ),
    );

    await tester.tap(find.widgetWithText(ElevatedButton, 'Register'));
    await tester.pumpAndSettle();

    expect(find.text('Registration failed'), findsOneWidget);
  });
}
