import 'package:flutter/material.dart';

import '../../core/call/call_service.dart';
import '../../services/provider_wallet_service.dart';
import '../consultation/incoming_call_screen.dart';
import '../wallet/withdrawal_screen.dart';

class ProviderDashboardScreen extends StatefulWidget {
  final int providerId;
  final String token;

  const ProviderDashboardScreen({
    super.key,
    required this.providerId,
    required this.token,
  });

  @override
  State<ProviderDashboardScreen> createState() =>
      _ProviderDashboardScreenState();
}

class _ProviderDashboardScreenState extends State<ProviderDashboardScreen> {
  final walletService = ProviderWalletService();
  double balance = 0;
  bool isLoadingWallet = false;
  List<Map<String, dynamic>> transactions = [];

  @override
  void initState() {
    super.initState();
    loadWallet();

    CallService.instance.onIncomingCall = (data) {
      debugPrint("Incoming call: $data");

      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) => IncomingCallScreen(
            channelName: data['channelName'],
            callerId: int.parse(data['callerId'].toString()),
            providerId: int.tryParse(data['providerId']?.toString() ?? '') ??
                widget.providerId,
          ),
        ),
      );
    };
  }

  Future<void> loadWallet() async {
    if (widget.token.isEmpty) return;

    setState(() {
      isLoadingWallet = true;
    });

    try {
      final results = await Future.wait([
        walletService.getBalance(widget.token),
        walletService.getTransactions(widget.token),
      ]);

      if (!mounted) return;

      setState(() {
        balance = results[0] as double;
        transactions = results[1] as List<Map<String, dynamic>>;
      });
    } catch (_) {
      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Failed to load wallet")),
      );
    } finally {
      if (mounted) {
        setState(() {
          isLoadingWallet = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Provider Dashboard"),
      ),
      body: RefreshIndicator(
        onRefresh: loadWallet,
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            Text(
              "Welcome Provider ${widget.providerId}",
              style: const TextStyle(fontSize: 20),
            ),
            const SizedBox(height: 24),
            if (isLoadingWallet) const LinearProgressIndicator(),
            Text(
              "Earnings Balance: ₦$balance",
              style: const TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => WithdrawalScreen(
                      token: widget.token,
                      service: walletService,
                    ),
                  ),
                ).then((_) => loadWallet());
              },
              child: const Text("Withdraw Earnings"),
            ),
            const SizedBox(height: 24),
            const Text(
              "Recent Earnings",
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            if (transactions.isEmpty)
              const Text("No earnings yet")
            else
              ...transactions.take(5).map((transaction) {
                final source = transaction['source']?.toString() ?? 'wallet';
                final amount = transaction['amount']?.toString() ?? '0';
                final type = transaction['type']?.toString() ?? '';

                return ListTile(
                  contentPadding: EdgeInsets.zero,
                  title: Text(source),
                  subtitle: Text(type),
                  trailing: Text("₦$amount"),
                );
              }),
          ],
        ),
      ),
    );
  }
}
