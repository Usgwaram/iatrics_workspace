import 'package:socket_io_client/socket_io_client.dart' as IO;

class SocketService {
  SocketService._();
  static final SocketService instance = SocketService._();

  IO.Socket? _socket;

  bool get isConnected => _socket?.connected ?? false;

  void connect({
    required String userId,
    required String role,
    required String baseUrl,
  }) {
    if (_socket != null && _socket!.connected) return;

    _socket = IO.io(
      baseUrl,
      IO.OptionBuilder()
          .setTransports(['websocket'])
          .disableAutoConnect()
          .build(),
    );

    _socket!.connect();

    _socket!.onConnect((_) {
      final normalizedRole = role.toUpperCase();

      if (normalizedRole == "PROVIDER") {
        _socket!.emit("register-provider", userId);
      } else {
        _socket!.emit("register-user", userId);
      }
    });

    _socket!.onConnectError((error) {
      print("❌ Provider socket connect error for $baseUrl: $error");
    });
  }

  void emit(String event, dynamic data) {
    _socket?.emit(event, data);
  }

  void on(String event, Function(dynamic) handler) {
    _socket?.on(event, handler);
  }

  void disconnect() {
    _socket?.disconnect();
    _socket = null;
  }
}
