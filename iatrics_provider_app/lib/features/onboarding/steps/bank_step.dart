import 'package:flutter/material.dart';
import '../onboarding_controller.dart';

class BankStep extends StatefulWidget {
  final String providerId;
  final String token;
  final OnboardingController controller;

  const BankStep({
    super.key,
    required this.providerId,
    required this.token,
    required this.controller,
  });

  @override
  State<BankStep> createState() => _BankStepState();
}

class _BankStepState extends State<BankStep> {
  final bankCodeController = TextEditingController(text: '044');
  final accountNumberController = TextEditingController();
  final accountNameController = TextEditingController();

  @override
  void dispose() {
    bankCodeController.dispose();
    accountNumberController.dispose();
    accountNameController.dispose();
    super.dispose();
  }

  Future<void> submit(BuildContext context) async {
    final bankCode = bankCodeController.text.trim();
    final accountNumber = accountNumberController.text.trim();
    final accountName = accountNameController.text.trim();

    if (bankCode.isEmpty || accountNumber.isEmpty || accountName.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content:
              Text('Enter your bank code, account number, and account name'),
        ),
      );
      return;
    }

    try {
      await widget.controller.submitBankSetup(
        providerId: int.parse(widget.providerId),
        token: widget.token,
        bankCode: bankCode,
        accountNumber: accountNumber,
        accountName: accountName,
      );
    } catch (e) {
      if (!context.mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            widget.controller.error ??
                e.toString().replaceAll('Exception:', ''),
          ),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Bank Setup")),
      body: AnimatedBuilder(
        animation: widget.controller,
        builder: (context, _) {
          return ListView(
            padding: const EdgeInsets.all(20),
            children: [
              TextField(
                controller: bankCodeController,
                decoration: const InputDecoration(
                  labelText: "Bank Code",
                  hintText: "Example: 044",
                ),
              ),
              TextField(
                controller: accountNumberController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: "Account Number",
                ),
              ),
              TextField(
                controller: accountNameController,
                decoration: const InputDecoration(
                  labelText: "Account Name",
                ),
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed:
                    widget.controller.isLoading ? null : () => submit(context),
                child: Text(
                  widget.controller.isLoading
                      ? "Submitting..."
                      : "Complete Bank Setup",
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
