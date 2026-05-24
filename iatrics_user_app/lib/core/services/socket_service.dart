import 'package:socket_io_client/socket_io_client.dart' as io;

class SocketService {
  SocketService._internal();
  static final SocketService instance = SocketService._internal();

  io.Socket? socket;

  bool _connected = false;
  bool _initialized = false;

  bool get isConnected => _connected;

  void connect({
    required String baseUrl,
    required String token,
  }) {
    if (_initialized || socket?.connected == true) return;

    socket = io.io(
      baseUrl,
      io.OptionBuilder()
          .setTransports(['websocket'])
          .disableAutoConnect()
          .setTimeout(10000)
          .enableReconnection()
          .setReconnectionAttempts(5)
          .setReconnectionDelay(1000)
          .setAuth({'token': token}) // 🔥 AUTH SAFE SOCKET
          .build(),
    );

    socket!.onConnect((_) {
      _connected = true;
      _initialized = true;
      print("🟢 Socket connected: $baseUrl");
    });

    socket!.onDisconnect((_) {
      _connected = false;
      _initialized = false;
      print("🔴 Socket disconnected");
    });

    socket!.onConnectError((err) {
      print("❌ Socket connect error for $baseUrl: $err");
    });

    socket!.connect();
  }

  void emit(String event, dynamic data) {
    socket?.emit(event, data);
  }

  void on(String event, Function(dynamic) handler) {
    socket?.on(event, handler);
  }

  void off(String event) {
    socket?.off(event);
  }

  void disconnect() {
    socket?.disconnect();
    socket = null;
    _connected = false;
    _initialized = false;
  }
}
