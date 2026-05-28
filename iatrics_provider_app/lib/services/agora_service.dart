import 'package:agora_rtc_engine/agora_rtc_engine.dart';

class AgoraService {
  AgoraService._();

  static final AgoraService instance = AgoraService._();
  static const _agoraAppId = String.fromEnvironment(
    'AGORA_APP_ID',
    defaultValue: '114a1c0095cc4175ada6e0b2082d7c3d',
  );

  RtcEngine? _engine;
  bool _initialized = false;

  Future<void> init() async {
    if (_initialized) return;

    _engine = createAgoraRtcEngine();

    await _engine!.initialize(
      const RtcEngineContext(
        appId: _agoraAppId,
      ),
    );

    await _engine!.enableVideo();

    _initialized = true;
  }

  RtcEngine get engine {
    if (_engine == null) {
      throw Exception("Agora not initialized");
    }
    return _engine!;
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
      options: const ChannelMediaOptions(
        channelProfile: ChannelProfileType.channelProfileCommunication,
        clientRoleType: ClientRoleType.clientRoleBroadcaster,
        publishCameraTrack: true,
        publishMicrophoneTrack: true,
        autoSubscribeAudio: true,
        autoSubscribeVideo: true,
      ),
    );
  }

  Future<void> leaveChannel() async {
    await engine.leaveChannel();
  }

  Future<void> dispose() async {
    await _engine?.release();
    _engine = null;
    _initialized = false;
  }
}
