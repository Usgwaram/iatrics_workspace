import 'package:flutter/material.dart';

class ConsultationSummaryScreen extends StatelessWidget {
  final String channelName;

  const ConsultationSummaryScreen({
    super.key,
    required this.channelName,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Consultation Detail")),
      body: Center(
        child: Text("Call ended for channel: $channelName"),
      ),
    );
  }
}
