import 'package:flutter/material.dart';

import '../../utils/auth_token.dart';
import 'wallet_service.dart';

class BankTransferScreen extends StatefulWidget {
  final WalletService service;
  final VoidCallback? onTransferComplete;

  BankTransferScreen({
    super.key,
    WalletService? service,
    this.onTransferComplete,
  }) : service = service ?? WalletService();

  @override
  State<BankTransferScreen> createState() => _BankTransferScreenState();
}

class _BankTransferScreenState extends State<BankTransferScreen> {
  final amountController = TextEditingController();
  final bankCodeController = TextEditingController(text: '044');
  final accountNumberController = TextEditingController();
  final accountNameController = TextEditingController();

  bool isSubmitting = false;

  @override
  void dispose() {
    amountController.dispose();
    bankCodeController.dispose();
    accountNumberController.dispose();
    accountNameController.dispose();
    super.dispose();
  }

  Future<void> submitTransfer() async {
    if (isSubmitting) return;

    final token = await AuthToken.getToken();
    final amount = double.tryParse(amountController.text.trim()) ?? 0;

    if (token == null || token.isEmpty) {
      showMessage('Please log in again');
      return;
    }

    setState(() {
      isSubmitting = true;
    });

    try {
      await widget.service.requestBankTransfer(
        token: token,
        amount: amount,
        bankCode: bankCodeController.text.trim(),
        accountNumber: accountNumberController.text.trim(),
        accountName: accountNameController.text.trim(),
      );

      widget.onTransferComplete?.call();

      if (!mounted) return;
      showMessage('Bank transfer requested');
      Navigator.pop(context);
    } catch (e) {
      if (!mounted) return;
      showMessage(e.toString().replaceAll('Exception:', '').trim());
    } finally {
      if (mounted) {
        setState(() {
          isSubmitting = false;
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
      appBar: AppBar(title: const Text('Bank Transfer')),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          TextField(
            controller: amountController,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(labelText: 'Amount'),
          ),
          TextField(
            controller: bankCodeController,
            decoration: const InputDecoration(labelText: 'Bank Code'),
          ),
          TextField(
            controller: accountNumberController,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(labelText: 'Account Number'),
          ),
          TextField(
            controller: accountNameController,
            decoration: const InputDecoration(labelText: 'Account Name'),
          ),
          const SizedBox(height: 20),
          ElevatedButton(
            onPressed: isSubmitting ? null : submitTransfer,
            child: Text(isSubmitting ? 'Submitting...' : 'Request Transfer'),
          ),
        ],
      ),
    );
  }
}
