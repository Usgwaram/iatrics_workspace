import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

class FundWalletScreen extends StatelessWidget {
  const FundWalletScreen({super.key});

  void startPayment() async {
    final url = Uri.parse("http://192.168.1.100:5002/api/paystack/initiate");

    if (await canLaunchUrl(url)) {
      await launchUrl(url, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Fund Wallet")),
      body: Center(
        child: ElevatedButton(
          onPressed: startPayment,
          child: const Text("Pay with Paystack"),
        ),
      ),
    );
  }
}