import 'package:flutter/material.dart';

import '../feedback/feedback_screen.dart';
import '../uploads/consultation_file_upload_screen.dart';

class ConsultationDetailScreen extends StatelessWidget {
  final dynamic data;

  const ConsultationDetailScreen({super.key, required this.data});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Consultation Detail")),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Text("Consultation: ${data.toString()}"),
          const SizedBox(height: 20),
          ElevatedButton.icon(
            onPressed: data is Map && data['id'] != null
                ? () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => ConsultationFileUploadScreen(
                          consultationId: data['id'],
                        ),
                      ),
                    );
                  }
                : null,
            icon: const Icon(Icons.upload_file),
            label: const Text('Upload lab result / image'),
          ),
          const SizedBox(height: 12),
          OutlinedButton.icon(
            onPressed: data is Map
                ? () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => FeedbackScreen(
                          consultationId: data['id'],
                          providerId: data['providerId'],
                        ),
                      ),
                    );
                  }
                : null,
            icon: const Icon(Icons.rate_review),
            label: const Text('Review or complain'),
          ),
        ],
      ),
    );
  }
}
