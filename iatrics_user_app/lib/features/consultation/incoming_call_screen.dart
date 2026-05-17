import 'package:flutter/material.dart';
import 'package:audioplayers/audioplayers.dart';

import '../../core/services/call_service.dart';
import 'video_call_screen.dart';

class IncomingCallScreen extends StatefulWidget {
  final String channelName;

  const IncomingCallScreen({
    super.key,
    required this.channelName,
  });

  @override
  State<IncomingCallScreen> createState() => _IncomingCallScreenState();
}

class _IncomingCallScreenState extends State<IncomingCallScreen> {
  late final AudioPlayer _ringtonePlayer;

  @override
  void initState() {
    super.initState();
    _ringtonePlayer = AudioPlayer();
    _playRingtone();
  }

  Future<void> _playRingtone() async {
    try {
      await _ringtonePlayer.setReleaseMode(ReleaseMode.loop);
      await _ringtonePlayer.play(AssetSource('audio/ringtone.mp3'));
    } catch (_) {}
  }

  Future<void> _stopRingtone() async {
    try {
      await _ringtonePlayer.stop();
    } catch (_) {}
  }

  @override
  void dispose() {
    _ringtonePlayer.dispose();
    super.dispose();
  }

  Future<void> _acceptCall() async {
    await _stopRingtone();
    if (!mounted) return;

    CallService().acceptCall(widget.channelName);

    Navigator.pushReplacement(
      context,
      MaterialPageRoute(
        builder: (_) => VideoCallScreen(
          channelName: widget.channelName,
          uid: 0,
        ),
      ),
    );
  }

  Future<void> _declineCall() async {
    await _stopRingtone();
    if (!mounted) return;

    CallService().declineCall(widget.channelName);
    Navigator.pop(context);
  }

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
                onPressed: _acceptCall,
              ),

              const SizedBox(width: 40),

              // ❌ DECLINE CALL
              IconButton(
                icon: const Icon(Icons.call_end, color: Colors.red),
                iconSize: 60,
                onPressed: _declineCall,
              ),
            ],
          ),
        ],
      ),
    );
  }
}
