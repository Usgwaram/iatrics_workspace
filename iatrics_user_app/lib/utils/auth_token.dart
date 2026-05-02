import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AuthToken {
  static const _secureStorage = FlutterSecureStorage();
  static const _key = 'auth_token';

  // 🔐 SAVE TOKEN
  static Future<void> saveToken(String token) async {
    if (kIsWeb) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_key, token);
    } else {
      await _secureStorage.write(key: _key, value: token);
    }
  }

  // 🔑 GET TOKEN
  static Future<String?> getToken() async {
    if (kIsWeb) {
      final prefs = await SharedPreferences.getInstance();
      return prefs.getString(_key);
    } else {
      return await _secureStorage.read(key: _key);
    }
  }

  // 🚪 CLEAR TOKEN
  static Future<void> clearToken() async {
    if (kIsWeb) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(_key);
    } else {
      await _secureStorage.delete(key: _key);
    }
  }
}