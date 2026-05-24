import '../realtime/socket_service.dart';

class CallService {
  CallService._();
  static final CallService instance = CallService._();

  late SocketService _socket;
  bool _initialized = false;

  Function(dynamic data)? onIncomingCall;
  Function(dynamic data)? onCallEnded;

  void initialize({required SocketService socket}) {
    if (_initialized) return;

    _socket = socket;

    _socket.on("incoming-call", (data) {
      onIncomingCall?.call(data);
    });

    _socket.on("call-ended", (data) {
      onCallEnded?.call(data);
    });

    _initialized = true;
  }

  void acceptCall(
    String channelName, {
    required int userId,
  }) {
    _socket.emit("accept-call", {
      "channelName": channelName,
      "userId": userId,
    });
  }

  void declineCall(
    String channelName, {
    required int userId,
  }) {
    _socket.emit("decline-call", {
      "channelName": channelName,
      "userId": userId,
    });
  }

  void endCall(String channelName) {
    _socket.emit("end-call", {
      "channelName": channelName,
    });
  }
}
