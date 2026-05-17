import 'dart:async';

import 'package:agora_rtc_engine/agora_rtc_engine.dart';
import 'package:flutter/material.dart';

import '../../core/call/call_service.dart';
import '../../services/agora_service.dart';

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

    setupCall();
    listenForCallEnd();
    startTimer();
  }

  Future<void> setupCall() async {
    await AgoraService.instance.init();

    engine = AgoraService.instance.engine;

    engine.registerEventHandler(
      RtcEngineEventHandler(
        onUserJoined: (connection, uid, elapsed) {
          if (!mounted) return;

          setState(() {
            remoteUid = uid;
          });
        },
        onUserOffline: (connection, uid, reason) {
          endCall();
        },
      ),
    );

    await AgoraService.instance.joinChannel(
      token: "",
      channelName: widget.channelName,
      uid: widget.uid,
    );
  }

  // ============================
  // TIMER
  // ============================
  void startTimer() {
    callTimer = Timer.periodic(
      const Duration(seconds: 1),
      (_) {
        if (!mounted) return;

        setState(() {
          seconds++;
        });
      },
    );
  }

  String formatTime() {
    final m = (seconds ~/ 60).toString().padLeft(2, '0');
    final s = (seconds % 60).toString().padLeft(2, '0');

    return "$m:$s";
  }

  // ============================
  // CALL END LISTENER
  // ============================
  void listenForCallEnd() {
    CallService.instance.onCallEnded = (_) {
      if (!mounted) return;

      Navigator.pop(context);
    };
  }

  // ============================
  // CONTROLS
  // ============================
  void toggleMute() {
    setState(() {
      muted = !muted;
    });

    engine.muteLocalAudioStream(muted);
  }

  void toggleSpeaker() {
    setState(() {
      speakerOn = !speakerOn;
    });

    engine.setEnableSpeakerphone(speakerOn);
  }

  void switchCamera() {
    engine.switchCamera();
  }

  void toggleVideo() {
    setState(() {
      videoEnabled = !videoEnabled;
    });

    engine.muteLocalVideoStream(!videoEnabled);
  }

  Future<void> endCall() async {
    CallService.instance.endCall(widget.channelName);

    await AgoraService.instance.leaveChannel();

    if (!mounted) return;

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
          // REMOTE VIDEO
          if (remoteUid != null)
            AgoraVideoView(
              controller: VideoViewController.remote(
                rtcEngine: engine,
                canvas: VideoCanvas(uid: remoteUid),
                connection: RtcConnection(
                  channelId: widget.channelName,
                ),
              ),
            )
          else
            const Center(
              child: Text(
                "Waiting for user...",
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                ),
              ),
            ),

          // LOCAL PREVIEW
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

          // TIMER
          Positioned(
            top: 40,
            left: 20,
            child: Text(
              formatTime(),
              style: const TextStyle(
                color: Colors.white,
                fontSize: 18,
              ),
            ),
          ),

          // CONTROLS
          Positioned(
            bottom: 40,
            left: 0,
            right: 0,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                iconBtn(
                  Icons.mic,
                  toggleMute,
                  active: !muted,
                ),
                iconBtn(
                  Icons.volume_up,
                  toggleSpeaker,
                  active: speakerOn,
                ),
                iconBtn(
                  Icons.switch_camera,
                  switchCamera,
                ),
                iconBtn(
                  Icons.videocam,
                  toggleVideo,
                  active: videoEnabled,
                ),
                iconBtn(
                  Icons.call_end,
                  endCall,
                  color: Colors.red,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget iconBtn(
    IconData icon,
    VoidCallback onTap, {
    bool active = true,
    Color? color,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: CircleAvatar(
        radius: 25,
        backgroundColor: color ?? (active ? Colors.white : Colors.grey),
        child: Icon(
          icon,
          color: Colors.black,
        ),
      ),
    );
  }

  // ============================
  // CLEANUP
  // ============================
  @override
  void dispose() {
    callTimer?.cancel();

    super.dispose();
  }
}
