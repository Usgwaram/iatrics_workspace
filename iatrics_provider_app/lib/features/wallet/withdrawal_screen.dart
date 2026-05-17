import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import '../../utils/network_config.dart';

class WithdrawalScreen extends StatefulWidget {
  final String providerId;

  const WithdrawalScreen({super.key, required this.providerId});

  @override
  State<WithdrawalScreen> createState() => _WithdrawalScreenState();
}

class _WithdrawalScreenState extends State<WithdrawalScreen> {
  final amountController = TextEditingController();
  final bankController = TextEditingController();
  final accountNumberController = TextEditingController();
  final accountNameController = TextEditingController();

  Future<void> requestWithdrawal() async {
    final res = await http.post(
      Uri.parse("${NetworkConfig.baseUrl}/api/withdrawals/request"),
      headers: {"Content-Type": "application/json"},
      body: jsonEncode({
        "providerId": widget.providerId,
        "amount": double.parse(amountController.text),
        "bankCode": bankController.text,
        "accountNumber": accountNumberController.text,
        "accountName": accountNameController.text,
      }),
    );

    if (res.statusCode == 200) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Withdrawal requested")),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Failed")),
      );
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
              onPressed: requestWithdrawal,
              child: const Text("Request Withdrawal"),
            )
          ],
        ),
      ),
    );
  }
}
