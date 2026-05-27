import 'package:flutter/material.dart';

import '../../core/services/socket_manager.dart';
import '../consultation/user_consultation_history.dart';
import '../doctors/available_doctors_screen.dart';
import '../doctors/doctor_service.dart';
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
  final DoctorService doctorService = DoctorService();
  bool isCalling = false;

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

  Future<void> placeCall() async {
    setState(() {
      isCalling = true;
    });

    try {
      final onlineDoctors = await doctorService.listDoctors(onlineOnly: true);

      if (!mounted) return;

      if (onlineDoctors.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("No provider is online right now")),
        );
        return;
      }

      final providerId = onlineDoctors.first['id'].toString();
      final channelName = "call_${DateTime.now().millisecondsSinceEpoch}";

      socketManager.startCall(
        fromId: widget.userId,
        toId: providerId,
        channel: channelName,
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString().replaceAll('Exception:', ''))),
      );
    } finally {
      if (mounted) {
        setState(() {
          isCalling = false;
        });
      }
    }
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
            onPressed: isCalling ? null : placeCall,
            icon: const Icon(Icons.video_call),
            label: Text(isCalling ? "Calling..." : "Call Online Provider"),
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
