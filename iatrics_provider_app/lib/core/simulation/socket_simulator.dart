import 'dart:async';

class SocketSimulator {
  static final StreamController<Map<String, dynamic>> _socket =
  StreamController.broadcast();

  static Stream<Map<String, dynamic>> get stream => _socket.stream;

  static void emit(String event, Map<String, dynamic> data) {
    _socket.add({
      "event": event,
      "data": data,
    });
  }

  static void simulateCallStart(int consultationId) {
    emit("call_started", {"consultationId": consultationId});
  }

  static void simulateCallEnd(int consultationId) {
    emit("call_ended", {"consultationId": consultationId});
  }
}