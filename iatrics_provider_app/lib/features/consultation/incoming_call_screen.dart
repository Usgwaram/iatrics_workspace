import 'package:flutter/material.dart';
import '../../core/services/call_service.dart';
import 'video_call_screen.dart';

class IncomingCallScreen extends StatelessWidget {
  final String channelName;
  final String callerId;

  const IncomingCallScreen({
    super.key,
    required this.channelName,
    required this.callerId,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Incoming Call")),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text("Incoming Video Call"),

            const SizedBox(height: 30),

            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                IconButton(
                  icon: const Icon(Icons.call, color: Colors.green),
                  iconSize: 50,
                  onPressed: () {
                    CallService().acceptCall(channelName);

                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => VideoCallScreen(
                          channelName: channelName,
                          uid: callerId,
                        ),
                      ),
                    );
                  },
                ),

                const SizedBox(width: 40),

                IconButton(
                  icon: const Icon(Icons.call_end, color: Colors.red),
                  iconSize: 50,
                  onPressed: () {
                    CallService().declineCall(channelName);
                    Navigator.pop(context);
                  },
                ),
              ],
            )
          ],
        ),
      ),
    );
  }
}