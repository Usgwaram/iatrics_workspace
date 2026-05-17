import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:iatrics_user_app/main.dart';
import 'package:integration_test/integration_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('user can log in and reach the dashboard', (tester) async {
    SharedPreferences.setMockInitialValues({});

    await tester.pumpWidget(const MyApp(connectSocket: false));
    await tester.pumpAndSettle();

    expect(find.text('Login'), findsWidgets);
    expect(find.text('User ID'), findsOneWidget);

    await tester.enterText(find.byType(TextField), '1');
    await tester.tap(find.widgetWithText(ElevatedButton, 'Login'));

    await tester.pump(const Duration(seconds: 1));
    await tester.pumpAndSettle();

    expect(find.text('User Dashboard'), findsOneWidget);
    expect(find.text('Call Provider'), findsOneWidget);
  });
}
