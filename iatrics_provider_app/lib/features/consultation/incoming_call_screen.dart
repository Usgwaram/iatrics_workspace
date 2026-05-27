import 'package:flutter/material.dart';
import 'package:audioplayers/audioplayers.dart';

import '../../core/call/call_service.dart';
import 'video_call_screen.dart';

class IncomingCallScreen extends StatefulWidget {
  final String channelName;
  final int callerId;
  final int providerId;

  const IncomingCallScreen({
    super.key,
    required this.channelName,
    required this.callerId,
    required this.providerId,
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

    CallService.instance.acceptCall(
      widget.channelName,
      userId: widget.callerId,
    );

    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => VideoCallScreen(
          channelName: widget.channelName,
          uid: widget.providerId,
        ),
      ),
    );
  }

  Future<void> _declineCall() async {
    await _stopRingtone();
    if (!mounted) return;

    CallService.instance.declineCall(
      widget.channelName,
      userId: widget.callerId,
    );
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Incoming Call"),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text(
              "Incoming Video Call",
              style: TextStyle(fontSize: 20),
            ),
            const SizedBox(height: 30),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                IconButton(
                  icon: const Icon(
                    Icons.call,
                    color: Colors.green,
                  ),
                  iconSize: 50,
                  onPressed: _acceptCall,
                ),
                const SizedBox(width: 40),
                IconButton(
                  icon: const Icon(
                    Icons.call_end,
                    color: Colors.red,
                  ),
                  iconSize: 50,
                  onPressed: _declineCall,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
