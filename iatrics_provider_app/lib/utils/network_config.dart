import 'package:flutter/foundation.dart';

class NetworkConfig {
  static const _definedBaseUrl = String.fromEnvironment('API_BASE_URL');

  static String get baseUrl {
    if (_definedBaseUrl.isNotEmpty) {
      return _normalizeBaseUrl(_definedBaseUrl);
    }

    if (kDebugMode && kIsWeb) {
      return "http://localhost:5002";
    }

    return "https://api.iatrics.ng";
  }

  static String _normalizeBaseUrl(String value) {
    final trimmed = value.trim().replaceFirst(RegExp(r'/+$'), '');
    final missingColonMatch = RegExp(
      r'^(https?://\d+\.\d+\.\d+\.\d+)\.(\d+)$',
    ).firstMatch(trimmed);

    if (missingColonMatch != null) {
      return '${missingColonMatch.group(1)}:${missingColonMatch.group(2)}';
    }

    return trimmed;
  }
}
