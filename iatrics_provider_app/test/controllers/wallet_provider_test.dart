import 'package:flutter_test/flutter_test.dart';
import 'package:iatrics_provider_app/providers/wallet_provider.dart';

void main() {
  group('WalletProvider', () {
    test('sets balance and adds earnings', () {
      final wallet = WalletProvider();
      var notifications = 0;

      wallet.addListener(() {
        notifications++;
      });

      wallet.setBalance(2500);
      wallet.addEarning(750);

      expect(wallet.balance, 3250);
      expect(notifications, 2);
    });
  });
}
