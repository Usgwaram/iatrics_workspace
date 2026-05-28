import 'dart:async';
import 'dart:convert';
import 'package:agora_rtc_engine/agora_rtc_engine.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

import '../../core/services/call_service.dart';
import '../../utils/network_config.dart';

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
  RtcEngine? engine;

  int? remoteUid;
  bool isInitializing = true;
  String? setupError;
  bool muted = false;
  bool speakerOn = true;
  bool videoEnabled = true;
  static const agoraAppId = String.fromEnvironment('AGORA_APP_ID');

  Timer? callTimer;
  int seconds = 0;

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
    try {
      final rtcEngine = createAgoraRtcEngine();
      engine = rtcEngine;

      if (agoraAppId.isEmpty) {
        throw StateError('AGORA_APP_ID must be provided with --dart-define');
      }

      await rtcEngine.initialize(
        const RtcEngineContext(
          appId: agoraAppId,
        ),
      );
      await rtcEngine.enableVideo();
      await rtcEngine.startPreview();

      rtcEngine.registerEventHandler(
        RtcEngineEventHandler(
          onJoinChannelSuccess: (connection, elapsed) {
            debugPrint(
              "Agora user joined ${connection.channelId} as ${widget.uid}",
            );
          },
          onUserJoined: (connection, uid, elapsed) {
            debugPrint("Agora user saw remote uid $uid");
            if (!mounted) return;
            setState(() {
              remoteUid = uid;
            });
          },
          onError: (err, msg) {
            debugPrint("Agora user error $err $msg");
          },
          onUserOffline: (connection, uid, reason) {
            endCall();
          },
        ),
      );

      final token = await fetchAgoraToken();

      await rtcEngine.joinChannel(
        token: token,
        channelId: widget.channelName,
        uid: widget.uid,
        options: const ChannelMediaOptions(),
      );

      if (!mounted) return;
      setState(() {
        isInitializing = false;
      });
    } catch (error) {
      if (!mounted) return;
      setState(() {
        setupError = error.toString();
        isInitializing = false;
      });
    }
  }

  Future<String> fetchAgoraToken() async {
    final response = await http.get(
      Uri.parse(
        "${NetworkConfig.baseUrl}/api/agora/token?channel=${widget.channelName}&uid=${widget.uid}",
      ),
    );

    if (response.statusCode != 200) {
      throw StateError('Unable to fetch Agora token');
    }

    final body = jsonDecode(response.body) as Map<String, dynamic>;
    return body['token'] as String;
  }

  // ============================
  // TIMER
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
  // SOCKET LISTENER
  // ============================
  void listenForCallEnd() {
    CallService().onCallEnded(() {
      if (mounted) Navigator.pop(context);
    });
  }

  // ============================
  // CONTROLS
  // ============================
  void toggleMute() {
    final rtcEngine = engine;
    if (rtcEngine == null) return;

    setState(() => muted = !muted);
    rtcEngine.muteLocalAudioStream(muted);
  }

  void toggleSpeaker() {
    final rtcEngine = engine;
    if (rtcEngine == null) return;

    setState(() => speakerOn = !speakerOn);
    rtcEngine.setEnableSpeakerphone(speakerOn).catchError((_) {});
  }

  void switchCamera() {
    engine?.switchCamera();
  }

  void toggleVideo() {
    final rtcEngine = engine;
    if (rtcEngine == null) return;

    setState(() => videoEnabled = !videoEnabled);
    rtcEngine.muteLocalVideoStream(!videoEnabled);
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
    final rtcEngine = engine;

    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          if (setupError != null)
            Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Text(
                  setupError!,
                  style: const TextStyle(color: Colors.white),
                  textAlign: TextAlign.center,
                ),
              ),
            )
          else if (isInitializing || rtcEngine == null)
            const Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  CircularProgressIndicator(),
                  SizedBox(height: 16),
                  Text(
                    "Connecting video...",
                    style: TextStyle(color: Colors.white),
                  ),
                ],
              ),
            )
          else if (remoteUid != null)
            AgoraVideoView(
              controller: VideoViewController.remote(
                rtcEngine: rtcEngine,
                canvas: VideoCanvas(uid: remoteUid),
                connection: RtcConnection(channelId: widget.channelName),
              ),
            )
          else
            const Center(
              child: Text(
                "Waiting for user...",
                style: TextStyle(color: Colors.white),
              ),
            ),
          if (rtcEngine != null && setupError == null)
            Positioned(
              top: 40,
              right: 20,
              child: SizedBox(
                width: 100,
                height: 150,
                child: AgoraVideoView(
                  controller: VideoViewController(
                    rtcEngine: rtcEngine,
                    canvas: VideoCanvas(uid: widget.uid),
                  ),
                ),
              ),
            ),
          if (setupError == null)
            Positioned(
              top: 40,
              left: 20,
              child: Text(
                formatTime(),
                style: const TextStyle(color: Colors.white),
              ),
            ),
          if (setupError == null)
            Positioned(
              bottom: 40,
              left: 0,
              right: 0,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  iconBtn(Icons.mic, toggleMute, active: !muted),
                  iconBtn(Icons.volume_up, toggleSpeaker, active: speakerOn),
                  iconBtn(Icons.switch_camera, switchCamera),
                  iconBtn(Icons.videocam, toggleVideo, active: videoEnabled),
                  iconBtn(Icons.call_end, endCall, color: Colors.red),
                ],
              ),
            ),
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
        backgroundColor: color ?? (active ? Colors.white : Colors.grey),
        child: Icon(icon, color: Colors.black),
      ),
    );
  }

  @override
  void dispose() {
    callTimer?.cancel();
    engine?.leaveChannel();
    engine?.release();
    super.dispose();
  }
}
