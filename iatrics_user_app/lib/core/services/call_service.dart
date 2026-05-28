import 'package:flutter/material.dart';
import 'socket_service.dart';
import '../../features/consultation/incoming_call_screen.dart';

class CallService {
  static final CallService _instance = CallService._internal();
  factory CallService() => _instance;

  CallService._internal();

  SocketService socket = SocketService.instance;
  GlobalKey<NavigatorState>? navKey;

  // ============================
  // INITIALIZE
  // ============================
  void initialize({
    required SocketService socketInstance,
    required GlobalKey<NavigatorState> navigatorKey,
  }) {
    socket = socketInstance;
    navKey = navigatorKey;

    // Listen for incoming calls
    socket.on("incoming-call", (data) {
      navKey?.currentState?.push(
        MaterialPageRoute(
          builder: (_) => IncomingCallScreen(
            channelName: data["channelName"],
          ),
        ),
      );
    });
  }

  // ============================
  // EVENTS
  // ============================
  void onCallEnded(VoidCallback callback) {
    socket.on("call-ended", (_) => callback());
  }

  // ============================
  // ACTIONS
  // ============================
  void placeCall(String providerId, String channelName) {
    socket.emit("place-call", {
      "providerId": providerId,
      "channelName": channelName,
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
