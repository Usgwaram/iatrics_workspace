import 'package:flutter/material.dart';
import 'bank_step.dart';

class DocumentStep extends StatelessWidget {
  final String providerId;

  const DocumentStep({super.key, required this.providerId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Upload Documents")),
      body: Center(
        child: ElevatedButton(
          onPressed: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => BankStep(providerId: providerId),
              ),
            );
          },
          child: const Text("Submit Documents"),
        ),
      ),
    );
  }
}