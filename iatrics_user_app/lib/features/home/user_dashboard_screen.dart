import 'package:flutter/material.dart';

import '../../core/services/socket_manager.dart';
import '../consultation/user_consultation_history.dart';
import '../doctors/available_doctors_screen.dart';
import '../feedback/feedback_screen.dart';

class UserDashboardScreen extends StatefulWidget {
  final String userId;

  const UserDashboardScreen({
    super.key,
    required this.userId,
  });

  @override
  State<UserDashboardScreen> createState() => _UserDashboardScreenState();
}

class _UserDashboardScreenState extends State<UserDashboardScreen> {
  final SocketManager socketManager = SocketManager.instance;

  final String providerId = "2";

  @override
  void initState() {
    super.initState();

    // Register logged-in user socket room
    socketManager.initUser(
      userId: widget.userId,
    );

    // Listen for call events
    socketManager.onCallAccepted((data) {
      debugPrint("Call accepted: $data");
    });

    socketManager.onCallRejected((data) {
      debugPrint("Call rejected: $data");
    });

    socketManager.onCallEnded((data) {
      debugPrint("Call ended: $data");
    });
  }

  void placeCall() {
    final channelName = "call_${DateTime.now().millisecondsSinceEpoch}";

    socketManager.startCall(
      fromId: widget.userId,
      toId: providerId,
      channel: channelName,
    );
  }

  @override
  void dispose() {
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("User Dashboard"),
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          ElevatedButton.icon(
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => const AvailableDoctorsScreen(),
                ),
              );
            },
            icon: const Icon(Icons.medical_services),
            label: const Text("Choose Doctor"),
          ),
          const SizedBox(height: 12),
          ElevatedButton.icon(
            onPressed: placeCall,
            icon: const Icon(Icons.video_call),
            label: const Text("Call Provider"),
          ),
          const SizedBox(height: 12),
          ElevatedButton.icon(
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => UserConsultationHistory(
                    userId: widget.userId,
                  ),
                ),
              );
            },
            icon: const Icon(Icons.history),
            label: const Text("Consultation History"),
          ),
          const SizedBox(height: 12),
          OutlinedButton.icon(
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => const FeedbackScreen(),
                ),
              );
            },
            icon: const Icon(Icons.rate_review),
            label: const Text("Complaints"),
          ),
        ],
      ),
    );
  }
}
