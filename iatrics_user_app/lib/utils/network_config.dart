import 'package:flutter/foundation.dart';

class NetworkConfig {
  static const _definedBaseUrl = String.fromEnvironment('API_BASE_URL');

  static String get baseUrl {
    if (_definedBaseUrl.isNotEmpty) {
      return _definedBaseUrl;
    }

    if (kDebugMode && kIsWeb) {
      return "http://localhost:5002";
    }

    return "https://api.iatrics.ng";
  }
}
