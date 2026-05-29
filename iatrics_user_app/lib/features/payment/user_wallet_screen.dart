import 'package:flutter/material.dart';

import '../../core/services/socket_service.dart';
import '../../utils/auth_token.dart';
import 'bank_transfer_screen.dart';
import 'fund_wallet_screen.dart';
import 'wallet_service.dart';

class UserWalletScreen extends StatefulWidget {
  final WalletService? service;

  const UserWalletScreen({
    super.key,
    this.service,
  });

  @override
  State<UserWalletScreen> createState() => _UserWalletScreenState();
}

class _UserWalletScreenState extends State<UserWalletScreen> {
  final SocketService socket = SocketService.instance;

  late final WalletService service;
  double balance = 0;
  bool isLoading = false;
  List<Map<String, dynamic>> transactions = [];

  String? token;

  @override
  void initState() {
    super.initState();
    service = widget.service ?? WalletService();
    loadWallet();

    socket.on("wallet-updated", (data) {
      setState(() {
        balance = double.tryParse(data["balance"].toString()) ?? 0;
      });
    });
  }

  Future<void> loadWallet() async {
    final savedToken = await AuthToken.getToken();

    if (savedToken == null || savedToken.isEmpty) {
      return;
    }

    setState(() {
      isLoading = true;
      token = savedToken;
    });

    try {
      final results = await Future.wait([
        service.getBalance(savedToken),
        service.getTransactions(savedToken),
      ]);

      if (!mounted) return;

      setState(() {
        balance = results[0] as double;
        transactions = results[1] as List<Map<String, dynamic>>;
      });
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Failed to load wallet')),
      );
    } finally {
      if (mounted) {
        setState(() {
          isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Wallet"),
      ),
      body: RefreshIndicator(
        onRefresh: loadWallet,
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            if (isLoading) const LinearProgressIndicator(),
            const SizedBox(height: 12),
            Text(
              "Balance: ₦$balance",
              style: const TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 30),
            Row(
              children: [
                Expanded(
                  child: ElevatedButton(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => FundWalletScreen(
                            service: service,
                          ),
                        ),
                      ).then((_) => loadWallet());
                    },
                    child: const Text("Fund Wallet"),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: OutlinedButton(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => BankTransferScreen(
                            service: service,
                            onTransferComplete: loadWallet,
                          ),
                        ),
                      ).then((_) => loadWallet());
                    },
                    child: const Text("Bank Transfer"),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 30),
            const Text(
              'Recent Activity',
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            if (transactions.isEmpty)
              const Text('No transactions yet')
            else
              ...transactions.take(5).map((transaction) {
                final type = transaction['type']?.toString() ?? '';
                final source = transaction['source']?.toString() ?? 'wallet';
                final amount = transaction['amount']?.toString() ?? '0';

                return ListTile(
                  contentPadding: EdgeInsets.zero,
                  title: Text(source),
                  subtitle: Text(type),
                  trailing: Text('₦$amount'),
                );
              }),
          ],
        ),
      ),
    );
  }
}
