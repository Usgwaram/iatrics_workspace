import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

class ProviderEarningsScreen extends StatefulWidget {
  final String providerId;

  const ProviderEarningsScreen({super.key, required this.providerId});

  @override
  State<ProviderEarningsScreen> createState() =>
      _ProviderEarningsScreenState();
}

class _ProviderEarningsScreenState extends State<ProviderEarningsScreen> {
  double balance = 0;
  final amountCtrl = TextEditingController();

  Future getProviderWallet(String providerId) async {
    final res = await http.get(
        "http://192.168.1.100:5002/api/wallet/${widget.providerId}/provider"));

    final data = jsonDecode(res.body);
    setState(() {
    balance = (data["balance"] ?? 0).toDouble();
    });
  }

  Future requestWithdrawal(data) async {
    await http.post(
      Uri.parse("http://192.168.1.100:5002/api/withdrawals/request"),
      headers: {"Content-Type": "application/json"},
      body: jsonEncode({
        "providerId": widget.providerId,
        "amount": double.parse(amountCtrl.text),
      }),
    );

    fetchWallet();
  }

  @override
  void initState() {
    super.initState();
    fetchWallet();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Earnings")),

      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Text("Balance: ₦$balance",
                style: const TextStyle(fontSize: 28)),

            TextField(
              controller: amountCtrl,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(labelText: "Withdraw Amount"),
            ),

            const SizedBox(height: 20),

            ElevatedButton(
              onPressed: withdraw,
              child: const Text("Withdraw"),
            ),
          ],
        ),
      ),
    );
  }
}