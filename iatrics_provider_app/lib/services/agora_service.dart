class AgoraService {
  static const String appId = "YOUR_AGORA_APP_ID";

  static String generateChannelName(String consultationId) {
    return "consult_$consultationId";
  }
}