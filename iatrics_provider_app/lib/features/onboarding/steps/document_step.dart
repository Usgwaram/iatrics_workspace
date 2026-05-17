import 'package:flutter/material.dart';
import '../onboarding_controller.dart';
import 'bank_step.dart';

class DocumentStep extends StatelessWidget {
  final String providerId;
  final String token;
  final OnboardingController controller;

  const DocumentStep({
    super.key,
    required this.providerId,
    required this.token,
    required this.controller,
  });

  Future<void> submit(BuildContext context) async {
    try {
      await controller.submitDocuments(
        providerId: int.parse(providerId),
        token: token,
        licenseDocumentUrl: "submitted",
      );

      if (!context.mounted) return;

      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (_) => BankStep(
            providerId: providerId,
            token: token,
            controller: controller,
          ),
        ),
      );
    } catch (e) {
      if (!context.mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(controller.error ?? 'Document upload failed')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Upload Documents")),
      body: Center(
        child: ElevatedButton(
          onPressed: controller.isLoading ? null : () => submit(context),
          child: Text(
            controller.isLoading ? "Submitting..." : "Submit Documents",
          ),
        ),
      ),
    );
  }
}
