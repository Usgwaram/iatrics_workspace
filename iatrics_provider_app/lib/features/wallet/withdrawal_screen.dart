import 'package:flutter/material.dart';

import '../../services/provider_wallet_service.dart';

class WithdrawalScreen extends StatefulWidget {
  final String token;
  final ProviderWalletService service;

  WithdrawalScreen({
    super.key,
    required this.token,
    ProviderWalletService? service,
  }) : service = service ?? ProviderWalletService();

  @override
  State<WithdrawalScreen> createState() => _WithdrawalScreenState();
}

class _WithdrawalScreenState extends State<WithdrawalScreen> {
  final amountController = TextEditingController();
  final bankController = TextEditingController();
  final accountNumberController = TextEditingController();
  final accountNameController = TextEditingController();
  bool isSubmitting = false;

  @override
  void dispose() {
    amountController.dispose();
    bankController.dispose();
    accountNumberController.dispose();
    accountNameController.dispose();
    super.dispose();
  }

  Future<void> requestWithdrawal() async {
    if (isSubmitting) return;

    setState(() {
      isSubmitting = true;
    });

    try {
      await widget.service.requestWithdrawal(
        token: widget.token,
        amount: double.parse(amountController.text),
        bankCode: bankController.text.trim(),
        accountNumber: accountNumberController.text.trim(),
        accountName: accountNameController.text.trim(),
      );

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Withdrawal requested")),
      );

      Navigator.pop(context);
    } catch (e) {
      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(e.toString().replaceAll("Exception:", "").trim()),
        ),
      );
    } finally {
      if (mounted) {
        setState(() {
          isSubmitting = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Withdraw Funds")),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            TextField(
                controller: amountController,
                decoration: const InputDecoration(labelText: "Amount")),
            TextField(
                controller: bankController,
                decoration: const InputDecoration(labelText: "Bank")),
            TextField(
                controller: accountNumberController,
                decoration: const InputDecoration(labelText: "Account Number")),
            TextField(
                controller: accountNameController,
                decoration: const InputDecoration(labelText: "Account Name")),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: isSubmitting ? null : requestWithdrawal,
              child: Text(
                isSubmitting ? "Submitting..." : "Request Withdrawal",
              ),
            )
          ],
        ),
      ),
    );
  }
}
