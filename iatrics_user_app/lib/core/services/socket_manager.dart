import 'socket_service.dart';

class SocketManager {
  SocketManager._internal();

  static final SocketManager instance = SocketManager._internal();

  final SocketService _socket = SocketService.instance;

  // =========================
  // USER / PROVIDER JOIN
  // =========================

  void initUser({
    required String userId,
  }) {
    _socket.emit("register-user", userId);
  }

  void initProvider({
    required String providerId,
  }) {
    _socket.emit("register-provider", providerId);
  }

  // =========================
  // ONLINE STATUS
  // =========================

  void setOnline(String userId) {
    _socket.emit("online", {
      "userId": userId,
    });
  }

  // =========================
  // CALL SIGNALING
  // =========================

  void startCall({
    required String fromId,
    required String toId,
    required String channel,
  }) {
    _socket.emit("place-call", {
      "userId": fromId,
      "callerId": int.tryParse(fromId) ?? fromId,
      "providerId": toId,
      "channelName": channel,
    });
  }

  void acceptCall({
    required String channel,
  }) {
    _socket.emit("accept-call", {
      "channelName": channel,
    });
  }

  void rejectCall({
    required String channel,
  }) {
    _socket.emit("decline-call", {
      "channelName": channel,
    });
  }

  void endCall({
    required String channel,
  }) {
    _socket.emit("end-call", {
      "channelName": channel,
    });
  }

  // =========================
  // LISTENERS
  // =========================

  void onIncomingCall(Function(dynamic) callback) {
    _socket.on("incoming-call", callback);
  }

  void onCallAccepted(Function(dynamic) callback) {
    _socket.on("call-accepted", callback);
  }

  void onCallRejected(Function(dynamic) callback) {
    _socket.on("call-declined", callback);
  }

  void onCallEnded(Function(dynamic) callback) {
    _socket.on("call-ended", callback);
  }

  // =========================
  // CLEANUP
  // =========================

  void dispose() {
    _socket.disconnect();
  }
}
