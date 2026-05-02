import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'consultation_detail_screen.dart';

class UserConsultationHistory extends StatefulWidget {
  final String userId;

  const UserConsultationHistory({
    Key? key,
    required this.userId,
  }) : super(key: key);

  @override
  State<UserConsultationHistory> createState() =>
      _UserConsultationHistoryState();
}

class _UserConsultationHistoryState
    extends State<UserConsultationHistory> {

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
      final res = await http.get(
        Uri.parse(
          "http://192.168.1.100:5002/api/consultations/user/${widget.userId}",
        ),
      );

      if (res.statusCode == 200) {
        setState(() {
          consultations = jsonDecode(res.body);
          isLoading = false;
        });
      } else {
        throw Exception("Failed to load data");
      }
    } catch (e) {
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
                c['diagnosis'] ?? 'No diagnosis',
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                ),
              ),
              subtitle: Text(
                "₦${c['cost']} • ${c['createdAt'] ?? ''}",
              ),
              trailing: const Icon(Icons.arrow_forward_ios, size: 16),

              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) =>
                        ConsultationDetailScreen(data: c),
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