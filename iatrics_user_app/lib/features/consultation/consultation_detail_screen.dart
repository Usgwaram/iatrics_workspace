import 'package:flutter/material.dart';

class ConsultationDetailScreen extends StatelessWidget {
  final dynamic data;

  const ConsultationDetailScreen({super.key, required this.data});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Consultation Detail")),
      body: Center(
        child: Text("Consultation: ${data.toString()}"),
      ),
    );
  }
}
