import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:iatrics_user_app/features/payment/wallet_service.dart';

void main() {
  group('WalletService', () {
    test('loads wallet balance', () async {
      final service = WalletService(
        baseUrl: 'http://localhost:5002',
        client: MockClient((request) async {
          expect(request.url.path, '/api/wallet/balance');
          expect(request.headers['Authorization'], 'Bearer token');

          return http.Response('{"balance":7500}', 200);
        }),
      );

      expect(await service.getBalance('token'), 7500);
    });

    test('initializes wallet top-up and returns payment URL', () async {
      final service = WalletService(
        baseUrl: 'http://localhost:5002',
        client: MockClient((request) async {
          expect(request.url.path, '/api/wallet/topup');
          expect(request.body, contains('"amount":5000'));

          return http.Response(
            '{"data":{"authorization_url":"https://mock.paystack/wallet-topup"}}',
            200,
          );
        }),
      );

      final url = await service.initializeTopUp(
        token: 'token',
        amount: 5000,
      );

      expect(url, 'https://mock.paystack/wallet-topup');
    });

    test('requests bank transfer', () async {
      final service = WalletService(
        baseUrl: 'http://localhost:5002',
        client: MockClient((request) async {
          expect(request.url.path, '/api/withdrawals/request');
          expect(request.body, contains('"bankCode":"044"'));

          return http.Response(
            '{"success":true,"balance":2500}',
            200,
          );
        }),
      );

      final response = await service.requestBankTransfer(
        token: 'token',
        amount: 2500,
        bankCode: '044',
        accountNumber: '0123456789',
        accountName: 'Test User',
      );

      expect(response['success'], true);
      expect(response['balance'], 2500);
    });
  });
}
