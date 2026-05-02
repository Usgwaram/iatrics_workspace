import 'package:iatrics_user_app/core/services/agora_service.dart';

class AgoraService {
  static final AgoraService _instance = AgoraService._internal();
  factory AgoraService() => _instance;

  AgoraService._internal();

  RtcEngine? _engine;

  // ⚠️ Replace with your real Agora App ID later
  final String appId = "YOUR_AGORA_APP_ID";

  bool _initialized = false;

  // =========================
  // INIT ENGINE
  // =========================
  Future<void> init() async {
    if (_initialized) return;

    _engine = createAgoraRtcEngine();

    await _engine!.initialize(
      RtcEngineContext(appId: appId),
    );

    await _engine!.enableVideo();
    await _engine!.enableAudio();

    _initialized = true;
  }

  // =========================
  // JOIN CHANNEL
  // =========================
  Future<void> joinChannel({
    required String channelName,
    required String token,
    required int uid,
  }) async {
    if (_engine == null) await init();

    await _engine!.joinChannel(
      token: token,
      channelId: channelName,
      uid: uid,
      options: const ChannelMediaOptions(),
    );
  }

  // =========================
  // LEAVE CHANNEL
  // =========================
  Future<void> leaveChannel() async {
    await _engine?.leaveChannel();
  }

  // =========================
  // DISPOSE
  // =========================
  Future<void> dispose() async {
    await _engine?.release();
    _engine = null;
    _initialized = false;
  }
}