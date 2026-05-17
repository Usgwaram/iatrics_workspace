import 'package:flutter/material.dart';
import '../onboarding_controller.dart';
import 'approval_waiting.dart';

class BankStep extends StatelessWidget {
  final String providerId;
  final String token;
  final OnboardingController controller;

  const BankStep({
    super.key,
    required this.providerId,
    required this.token,
    required this.controller,
  });

  Future<void> submit(BuildContext context) async {
    try {
      await controller.submitBankSetup(
        providerId: int.parse(providerId),
        token: token,
        bankCode: "044",
        accountNumber: "0123456789",
        accountName: "Provider",
      );

      if (!context.mounted) return;

      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (_) => const WaitingApprovalScreen(),
        ),
      );
    } catch (e) {
      if (!context.mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(controller.error ?? 'Bank setup failed')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Bank Setup")),
      body: Center(
        child: ElevatedButton(
          onPressed: controller.isLoading ? null : () => submit(context),
          child: Text(
            controller.isLoading ? "Submitting..." : "Complete Bank Setup",
          ),
        ),
      ),
    );
  }
}
