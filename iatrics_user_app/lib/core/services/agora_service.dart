import 'package:agora_rtc_engine/agora_rtc_engine.dart';

class AgoraService {
  AgoraService._internal();

  static final AgoraService instance = AgoraService._internal();

  late RtcEngine engine;

  Future<void> initialize() async {
    engine = createAgoraRtcEngine();

    await engine.initialize(
      const RtcEngineContext(
        appId: "114a1c0095cc4175ada6e0b2082d7c91a74",
      ),
    );
  }

  Future<void> joinChannel({
    required String token,
    required String channelName,
    required int uid,
  }) async {
    await engine.joinChannel(
      token: token,
      channelId: channelName,
      uid: uid,
      options: const ChannelMediaOptions(),
    );
  }

  Future<void> leaveChannel() async {
    await engine.leaveChannel();
  }
}
