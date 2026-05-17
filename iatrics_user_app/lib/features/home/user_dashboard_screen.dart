import 'package:flutter/material.dart';

import '../../core/services/socket_manager.dart';

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
      body: Center(
        child: ElevatedButton(
          onPressed: placeCall,
          child: const Text("Call Provider"),
        ),
      ),
    );
  }
}
