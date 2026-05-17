import '../realtime/socket_service.dart';
import '../call/call_service.dart';
import '../../utils/network_config.dart';

class SocketInitializer {
  static void init({
    required String providerId,
    required SocketService socket,
    required CallService callService,
    String? baseUrl,
  }) {
    socket.connect(
      userId: providerId,
      role: "PROVIDER",
      baseUrl: baseUrl ?? NetworkConfig.baseUrl,
    );

    callService.initialize(socket: socket);

    callService.onIncomingCall = (data) {
      print("📞 Incoming Call: $data");
    };
  }
}
