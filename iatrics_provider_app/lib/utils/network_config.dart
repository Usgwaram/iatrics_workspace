import 'package:flutter/foundation.dart';

class NetworkConfig {
  static String get baseUrl {
    if (kIsWeb) {
      // ✅ For Chrome (running on same Mac)
      return "http://localhost:5002";
    }

    // ✅ For real devices (iPhone, Android)
    return "http://192.168.0.200:5002";
  }
}