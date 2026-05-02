import 'package:flutter/material.dart';
import 'financial_dashboard.dart';
import 'withdrawals_screen.dart';
import 'users_screen.dart';
import 'providers_screen.dart';

class AdminHome extends StatelessWidget {
  final String token;

  const AdminHome({super.key, required this.token});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Admin Panel")),
      body: ListView(
        children: [
          ListTile(
            title: const Text("Financial Dashboard"),
            onTap: () => Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => FinancialDashboard(token: token),
              ),
            ),
          ),
          ListTile(
            title: const Text("Withdrawals"),
            onTap: () => Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => WithdrawalsScreen(token: token),
              ),
            ),
          ),
          ListTile(
            title: const Text("Users"),
            onTap: () => Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => UsersScreen(token: token),
              ),
            ),
          ),
          ListTile(
            title: const Text("Providers"),
            onTap: () => Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => ProvidersScreen(token: token),
              ),
            ),
          ),
        ],
      ),
    );
  }
}