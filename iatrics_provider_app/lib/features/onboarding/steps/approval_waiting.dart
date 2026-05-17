import 'package:flutter/material.dart';

class WaitingApprovalScreen extends StatelessWidget {
  final bool isApproved;

  const WaitingApprovalScreen({
    super.key,
    this.isApproved = false,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.hourglass_empty, size: 60),
            const SizedBox(height: 10),
            Text(
              isApproved ? "Provider Approved" : "Waiting for Admin Approval",
            ),
          ],
        ),
      ),
    );
  }
}
