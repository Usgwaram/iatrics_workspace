import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

class ConsultationHistoryScreen extends StatefulWidget {
  final String providerId;

  const ConsultationHistoryScreen({super.key, required this.providerId});

  @override
  State<ConsultationHistoryScreen> createState() =>
      _ConsultationHistoryScreenState();
}

class _ConsultationHistoryScreenState
    extends State<ConsultationHistoryScreen> {

  Future<List<dynamic>> fetchHistory() async {
    final res = await http.get(
      Uri.parse("http://192.168.1.100:5002/api/consultations/provider/${widget.providerId}"),
    );

    final decoded = jsonDecode(res.body);
    return decoded["data"];

    if (res.statusCode == 200) {
      return jsonDecode(res.body);
    } else {
      throw Exception("Failed to load history");
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Past Consultations")),
      body: FutureBuilder<List<dynamic>>(
        future: fetchHistory(),
        builder: (context, snapshot) {

          // 🔄 LOADING
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          // ❌ ERROR
          if (snapshot.hasError) {
            return Center(
              child: Text("Error: ${snapshot.error}"),
            );
          }

          // 📭 EMPTY
          if (!snapshot.hasData || snapshot.data!.isEmpty) {
            return const Center(
              child: Text("No consultations yet"),
            );
          }

          // ✅ DATA
          final history = snapshot.data!;

          return ListView.builder(
            itemCount: history.length,
            itemBuilder: (_, i) {
              final item = history[i];

              return Card(
                margin: const EdgeInsets.symmetric(
                    horizontal: 12, vertical: 6),
                child: ListTile(
                  leading: const Icon(Icons.medical_services),

                  title: Text(
                    item["diagnosis"] ?? "No diagnosis",
                  ),

                  subtitle: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text("Prescription: ${item["prescription"] ?? "-"}"),
                      Text("Date: ${item["createdAt"] ?? "-"}"),
                    ],
                  ),

                  trailing: Text(
                    "₦${item["cost"] ?? 0}",
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      color: Colors.green,
                    ),
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}