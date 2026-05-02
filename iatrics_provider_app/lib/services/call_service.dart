import 'package:flutter/material.dart';
import 'socket_service.dart';
import '../../features/consultation/incoming_call_screen.dart';

class CallService {
  static final CallService _instance = CallService._internal();
  factory CallService() => _instance;

  CallService._internal();

  late SocketService socket;
  late GlobalKey<NavigatorState> navKey;

  void init({
    required SocketService socketInstance,
    required GlobalKey<NavigatorState> navigatorKey,
  }) {
    socket = socketInstance;
    navKey = navigatorKey;

    _listenIncomingCall();
    _listenCallEnded();
  }

  // ============================
  // INCOMING CALL
  // ============================
  void _listenIncomingCall() {
    socket.on("incoming-call", (data) {
      final channel = data["channelName"];
      final callerId = data["callerId"];

      navKey.currentState?.push(
        MaterialPageRoute(
          builder: (_) => IncomingCallScreen(
            channelName: channel,
            callerId: callerId,
          ),
        ),
      );
    });
  }

  // ============================
  // CALL ENDED
  // ============================
  void _listenCallEnded() {
    socket.on("call-ended", (_) {
      navKey.currentState?.popUntil((route) => route.isFirst);
    });
  }

  void acceptCall(String channelName) {
    socket.emit("accept-call", {"channelName": channelName});
  }

  void declineCall(String channelName) {
    socket.emit("decline-call", {"channelName": channelName});
  }

  void endCall(String channelName) {
    socket.emit("end-call", {"channelName": channelName});
  }
}