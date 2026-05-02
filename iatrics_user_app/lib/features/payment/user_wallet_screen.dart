import 'package:flutter/material.dart';
import 'package:iatrics_user_app/package:iatrics_user_app/core/services/socket_service.dart';

class WalletScreen extends StatefulWidget {
  final String userId;

  const WalletScreen({super.key, required this.userId});

  @override
  State<WalletScreen> createState() => _WalletScreenState();
}

class _WalletScreenState extends State<WalletScreen> {
  double balance = 0;

  @override
  void initState() {
    super.initState();

    final socket = SocketService();

    // 💰 REAL-TIME UPDATE
    socket.onWalletUpdate((data) {
      setState(() {
        balance = data['balance'].toDouble();
      });
    });
  }

  void fundWallet() {
    // 👉 Navigate to Paystack screen
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => const FundWalletScreen(),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("My Wallet")),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            // 💳 BALANCE CARD
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.green,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                children: [
                  const Text("Wallet Balance",
                      style: TextStyle(color: Colors.white70)),
                  const SizedBox(height: 10),
                  Text(
                    "₦${balance.toStringAsFixed(2)}",
                    style: const TextStyle(
                      fontSize: 28,
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 30),

            // 💰 FUND BUTTON
            ElevatedButton(
              onPressed: fundWallet,
              style: ElevatedButton.styleFrom(
                minimumSize: const Size(double.infinity, 50),
              ),
              child: const Text("Fund Wallet"),
            ),
          ],
        ),
      ),
    );
  }
}