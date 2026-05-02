import 'package:flutter/material.dart';
import 'package:iatrics_user_app/core/services/socket_service.dart';
import 'package:iatrics_user_app/core/services/call_service.dart';
import '../consultation/user_consultation_history.dart';

class UserDashboardScreen extends StatefulWidget {
  final String userId;

  const UserDashboardScreen({
    Key? key,
    required this.userId,
  }) : super(key: key);

  @override
  State<UserDashboardScreen> createState() => _UserDashboardScreenState();
}

class _UserDashboardScreenState extends State<UserDashboardScreen> {
  final SocketService socket = SocketService();

  @override
  void initState() {
    super.initState();

    // 🔌 Register user on socket
    socket.registerUser(widget.userId);
  }

  // ============================
  // 📞 CALL DOCTOR
  // ============================
  void requestCall() {
    CallService().placeCall(
      userId: widget.userId,
      providerId: "1", // 🔥 replace with dynamic later
      channelName: "test_channel",
    );
  }

  // ============================
  // 📂 GO TO CONSULTATIONS
  // ============================
  void goToConsultations() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) =>
            UserConsultationHistory(userId: widget.userId),
      ),
    );
  }

  // ============================
  // 🧱 UI
  // ============================
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("User Dashboard"),
        centerTitle: true,
      ),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [

            ElevatedButton(
              onPressed: () {
                Navigator.pushNamed(context, '/wallet');
              },
              child: Text("My Wallet"),
            ),
            // 📞 CALL DOCTOR BUTTON
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: requestCall,
                icon: const Icon(Icons.call),
                label: const Text("Call Doctor"),
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
              ),
            ),

            const SizedBox(height: 20),

            // 📂 MY CONSULTATIONS BUTTON
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: goToConsultations,
                icon: const Icon(Icons.history),
                label: const Text("My Consultations"),
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
              ),
            ),

          ],
        ),
      ),
    );
  }
}

