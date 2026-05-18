import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'consultation_detail_screen.dart';
import '../../utils/auth_token.dart';
import '../../utils/network_config.dart';

class UserConsultationHistory extends StatefulWidget {
  final String userId;
  final http.Client? client;

  const UserConsultationHistory({
    super.key,
    required this.userId,
    this.client,
  });

  @override
  State<UserConsultationHistory> createState() =>
      _UserConsultationHistoryState();
}

class _UserConsultationHistoryState extends State<UserConsultationHistory> {
  List consultations = [];
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    fetchConsultations();
  }

  // ============================
  // 📡 FETCH DATA
  // ============================
  Future<void> fetchConsultations() async {
    try {
      final token = await AuthToken.getToken();

      if (token == null || token.isEmpty) {
        throw Exception("Please log in again");
      }

      final res = await (widget.client ?? http.Client()).get(
        Uri.parse("${NetworkConfig.baseUrl}/api/consultations"),
        headers: {
          "Authorization": "Bearer $token",
        },
      );

      if (res.statusCode == 200) {
        final body = jsonDecode(res.body);
        setState(() {
          consultations = body is List ? body : body['data'] ?? [];
          isLoading = false;
        });
      } else {
        throw Exception("Failed to load data");
      }
    } catch (e) {
      if (!mounted) return;

      setState(() {
        isLoading = false;
      });

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Error: $e")),
      );
    }
  }

  // ============================
  // 🧱 UI
  // ============================
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("My Consultations")),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : consultations.isEmpty
              ? const Center(
                  child: Text("No consultations yet"),
                )
              : ListView.builder(
                  itemCount: consultations.length,
                  itemBuilder: (_, i) {
                    final c = consultations[i];

                    return Card(
                      margin: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 6),
                      child: ListTile(
                        title: Text(
                          c['type'] ?? 'Consultation',
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        subtitle: Text(
                          "₦${c['price'] ?? c['fee'] ?? '--'} • ${c['status'] ?? ''}",
                        ),
                        trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => ConsultationDetailScreen(data: c),
                            ),
                          );
                        },
                      ),
                    );
                  },
                ),
    );
  }
}
