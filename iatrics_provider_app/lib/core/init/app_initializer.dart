import '../realtime/socket_service.dart';
import '../call/call_service.dart';
import '../../utils/network_config.dart';

class AppInitializer {
  static bool _ready = false;

  static void init({
    required String userId,
    required String role,
  }) {
    if (_ready) return;

    final socket = SocketService.instance;

    socket.connect(
      baseUrl: NetworkConfig.baseUrl,
      userId: userId,
      role: role,
    );

    CallService.instance.initialize(socket: socket);

    _ready = true;
  }
}
