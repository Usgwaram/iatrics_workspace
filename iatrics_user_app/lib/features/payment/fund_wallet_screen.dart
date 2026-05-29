import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../utils/auth_token.dart';
import 'wallet_service.dart';

class FundWalletScreen extends StatefulWidget {
  final String? paymentUrl;
  final WalletService service;

  FundWalletScreen({
    super.key,
    this.paymentUrl,
    WalletService? service,
  }) : service = service ?? WalletService();

  @override
  State<FundWalletScreen> createState() => _FundWalletScreenState();
}

class _FundWalletScreenState extends State<FundWalletScreen> {
  final amountController = TextEditingController(text: '5000');
  bool isLoading = false;

  @override
  void dispose() {
    amountController.dispose();
    super.dispose();
  }

  Future<void> openPayment([String? url]) async {
    final paymentUrl = url ?? widget.paymentUrl;

    if (paymentUrl == null || paymentUrl.isEmpty) {
      return;
    }

    final uri = Uri.parse(paymentUrl);

    if (await canLaunchUrl(uri)) {
      await launchUrl(
        uri,
        mode: LaunchMode.externalApplication,
      );
    }
  }

  Future<void> initializePayment() async {
    if (isLoading) return;

    final token = await AuthToken.getToken();
    final amount = double.tryParse(amountController.text.trim()) ?? 0;

    if (token == null || token.isEmpty) {
      showMessage('Please log in again');
      return;
    }

    setState(() {
      isLoading = true;
    });

    try {
      final url = await widget.service.initializeTopUp(
        token: token,
        amount: amount,
      );

      if (url.contains('mock.paystack')) {
        if (!mounted) return;
        showMessage('Wallet funded');
        Navigator.pop(context);
        return;
      }

      await openPayment(url);
    } catch (e) {
      if (!mounted) return;
      showMessage(e.toString().replaceAll('Exception:', '').trim());
    } finally {
      if (mounted) {
        setState(() {
          isLoading = false;
        });
      }
    }
  }

  void showMessage(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Fund Wallet"),
      ),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            TextField(
              controller: amountController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(labelText: 'Amount'),
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: isLoading
                  ? null
                  : () {
                      if (widget.paymentUrl != null) {
                        openPayment();
                      } else {
                        initializePayment();
                      }
                    },
              child: Text(
                isLoading ? 'Initializing...' : 'Open Payment Page',
              ),
            ),
          ],
        ),
      ),
    );
  }
}
