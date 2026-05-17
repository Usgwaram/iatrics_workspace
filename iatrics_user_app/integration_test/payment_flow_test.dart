import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:iatrics_user_app/features/payment/fund_wallet_screen.dart';
import 'package:iatrics_user_app/features/payment/user_wallet_screen.dart';
import 'package:integration_test/integration_test.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('user opens wallet and starts fund-wallet flow', (tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: UserWalletScreen(),
      ),
    );

    expect(find.text('Wallet'), findsOneWidget);
    expect(find.text('Balance: ₦0.0'), findsOneWidget);

    await tester.tap(find.widgetWithText(ElevatedButton, 'Fund Wallet'));
    await tester.pumpAndSettle();

    expect(find.byType(FundWalletScreen), findsOneWidget);
    expect(find.text('Open Payment Page'), findsOneWidget);
  });
}
