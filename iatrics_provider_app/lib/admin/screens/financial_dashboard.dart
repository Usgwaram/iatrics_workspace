import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;

class _FinancialDashboardState extends State<FinancialDashboard> {
  late AdminApi api;
  Map<String, dynamic> summary = {};
  bool loading = true;

  @override
  void initState() {
    super.initState();
    api = AdminApi(widget.token);
    fetchSummary();
  }

  Future<void> fetchSummary() async {
    final data = await api.getSummary();

    setState(() {
      summary = data;
      loading = false;
    });
  }
  Widget card(String title, dynamic value) {
    return Expanded(
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              Text(title, style: const TextStyle(fontSize: 14)),
              const SizedBox(height: 10),
              Text(
                "₦${value ?? 0}",
                style: const TextStyle(
                    fontSize: 18, fontWeight: FontWeight.bold),
              )
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (loading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      appBar: AppBar(title: const Text("Financial Dashboard")),
      body: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          children: [
            Row(
              children: [
                card("Revenue", summary["totalRevenue"]),
                card("Payouts", summary["totalPayouts"]),
              ],
            ),
            Row(
              children: [
                card("Pending", summary["pending"]),
                card("Failed", summary["failed"]),
              ],
            ),
          ],
        ),
      ),
    );
  }
}