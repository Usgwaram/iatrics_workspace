import 'package:flutter/material.dart';
import 'approval_waiting.dart';

class BankStep extends StatelessWidget {
  final String providerId;

  const BankStep({super.key, required this.providerId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Bank Setup")),
      body: Center(
        child: ElevatedButton(
          onPressed: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => const WaitingApprovalScreen(),
              ),
            );
          },
          child: const Text("Complete Bank Setup"),
        ),
      ),
    );
  }
}