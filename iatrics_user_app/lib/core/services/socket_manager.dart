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
    _socket.emit("join_user", {
      "userId": userId,
    });
  }

  void initProvider({
    required String providerId,
  }) {
    _socket.emit("join_provider", {
      "providerId": providerId,
    });
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
    _socket.emit("call_start", {
      "from": fromId,
      "to": toId,
      "channel": channel,
    });
  }

  void acceptCall({
    required String channel,
  }) {
    _socket.emit("call_accept", {
      "channel": channel,
    });
  }

  void rejectCall({
    required String channel,
  }) {
    _socket.emit("call_reject", {
      "channel": channel,
    });
  }

  void endCall({
    required String channel,
  }) {
    _socket.emit("call_end", {
      "channel": channel,
    });
  }

  // =========================
  // LISTENERS
  // =========================

  void onIncomingCall(Function(dynamic) callback) {
    _socket.on("incoming_call", callback);
  }

  void onCallAccepted(Function(dynamic) callback) {
    _socket.on("call_accepted", callback);
  }

  void onCallRejected(Function(dynamic) callback) {
    _socket.on("call_rejected", callback);
  }

  void onCallEnded(Function(dynamic) callback) {
    _socket.on("call_ended", callback);
  }

  // =========================
  // CLEANUP
  // =========================

  void dispose() {
    _socket.disconnect();
  }
}
