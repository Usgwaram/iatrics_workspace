import 'dart:async';
import 'package:agora_rtc_engine/agora_rtc_engine.dart';
import 'package:flutter/material.dart';

import '../../core/services/socket_service.dart';
import '../../core/services/call_service.dart';

class VideoCallScreen extends StatefulWidget {
  final String channelName;
  final int uid;

  const VideoCallScreen({
    super.key,
    required this.channelName,
    required this.uid,
  });

  @override
  State<VideoCallScreen> createState() => _VideoCallScreenState();
}

class _VideoCallScreenState extends State<VideoCallScreen> {
  late RtcEngine engine;

  int? remoteUid;
  bool muted = false;
  bool speakerOn = true;
  bool videoEnabled = true;

  Timer? callTimer;
  int seconds = 0;

  // ============================
  // INIT
  // ============================
  @override
  void initState() {
    super.initState();
    initAgora();
    listenForCallEnd();
    startTimer();
  }

  // ============================
  // AGORA INIT
  // ============================
  Future<void> initAgora() async {
    engine = createAgoraRtcEngine();

    await engine.initialize(
      const RtcEngineContext(
        appId: "YOUR_AGORA_APP_ID",
      ),
    );

    engine.registerEventHandler(
      RtcEngineEventHandler(
        onUserJoined: (connection, uid, elapsed) {
          setState(() {
            remoteUid = uid;
          });
        },
        onUserOffline: (connection, uid, reason) {
          endCall();
        },
      ),
    );

    // 🔐 TODO: Replace with backend token API
    final token = null;

    await engine.joinChannel(
      token: token,
      channelId: widget.channelName,
      uid: widget.uid,
      options: const ChannelMediaOptions(),
    );
  }

  // ============================
  // TIMER (for billing later)
  // ============================
  void startTimer() {
    callTimer = Timer.periodic(const Duration(seconds: 1), (_) {
      setState(() {
        seconds++;
      });
    });
  }

  String formatTime() {
    final m = (seconds ~/ 60).toString().padLeft(2, '0');
    final s = (seconds % 60).toString().padLeft(2, '0');
    return "$m:$s";
  }

  // ============================
  // SOCKET END LISTENER
  // ============================
  void listenForCallEnd() {
    CallService().onCallEnded(() {
      Navigator.pop(context);
    });
  }

  // ============================
  // CONTROLS
  // ============================
  void toggleMute() {
    setState(() => muted = !muted);
    engine.muteLocalAudioStream(muted);
  }

  void toggleSpeaker() {
    setState(() => speakerOn = !speakerOn);
    engine.setEnableSpeakerphone(speakerOn);
  }

  void switchCamera() {
    engine.switchCamera();
  }

  void toggleVideo() {
    setState(() => videoEnabled = !videoEnabled);
    engine.muteLocalVideoStream(!videoEnabled);
  }

  void endCall() {
    CallService().endCall(widget.channelName);
    Navigator.pop(context);
  }

  // ============================
  // UI
  // ============================
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          // Remote video
          if (remoteUid != null)
            AgoraVideoView(
              controller: VideoViewController.remote(
                rtcEngine: engine,
                canvas: VideoCanvas(uid: remoteUid),
                connection:
                RtcConnection(channelId: widget.channelName),
              ),
            )
          else
            const Center(
              child: Text(
                "Waiting for user...",
                style: TextStyle(color: Colors.white),
              ),
            ),

          // Local preview
          Positioned(
            top: 40,
            right: 20,
            child: SizedBox(
              width: 100,
              height: 150,
              child: AgoraVideoView(
                controller: VideoViewController(
                  rtcEngine: engine,
                  canvas: const VideoCanvas(uid: 0),
                ),
              ),
            ),
          ),

          // Timer
          Positioned(
            top: 40,
            left: 20,
            child: Text(
              formatTime(),
              style: const TextStyle(color: Colors.white),
            ),
          ),

          // Controls
          Positioned(
            bottom: 40,
            left: 0,
            right: 0,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                iconBtn(Icons.mic, toggleMute,
                    active: !muted),
                iconBtn(Icons.volume_up, toggleSpeaker,
                    active: speakerOn),
                iconBtn(Icons.switch_camera, switchCamera),
                iconBtn(Icons.videocam, toggleVideo,
                    active: videoEnabled),
                iconBtn(Icons.call_end, endCall,
                    color: Colors.red),
              ],
            ),
          )
        ],
      ),
    );
  }

  Widget iconBtn(IconData icon, VoidCallback onTap,
      {bool active = true, Color? color}) {
    return GestureDetector(
      onTap: onTap,
      child: CircleAvatar(
        radius: 25,
        backgroundColor:
        color ?? (active ? Colors.white : Colors.grey),
        child: Icon(icon, color: Colors.black),
      ),
    );
  }

  // ============================
  // CLEANUP
  // ============================
  @override
  void dispose() {
    callTimer?.cancel();
    engine.leaveChannel();
    engine.release();
    super.dispose();
  }
}