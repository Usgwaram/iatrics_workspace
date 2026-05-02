import 'package:flutter/material.dart';
import '../../core/services/call_service.dart';
import 'video_call_screen.dart';

class IncomingCallScreen extends StatelessWidget {
  final String channelName;

  const IncomingCallScreen({
    super.key,
    required this.channelName,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Incoming Call")),
      body: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Center(
            child: Text(
              "Incoming Video Call...",
              style: TextStyle(fontSize: 18),
            ),
          ),

          const SizedBox(height: 30),

          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // ✅ ACCEPT CALL
              IconButton(
                icon: const Icon(Icons.call, color: Colors.green),
                iconSize: 60,
                onPressed: () {
                  CallService().acceptCall(channelName);

                  Navigator.pushReplacement(
                    context,
                    MaterialPageRoute(
                      builder: (_) => VideoCallScreen(
                        channelName: channelName,
                        uid: 0, // 👈 IMPORTANT (must match VideoCallScreen)
                      ),
                    ),
                  );
                },
              ),

              const SizedBox(width: 40),

              // ❌ DECLINE CALL
              IconButton(
                icon: const Icon(Icons.call_end, color: Colors.red),
                iconSize: 60,
                onPressed: () {
                  CallService().declineCall(channelName);
                  Navigator.pop(context);
                },
              ),
            ],
          ),
        ],
      ),
    );
  }
}