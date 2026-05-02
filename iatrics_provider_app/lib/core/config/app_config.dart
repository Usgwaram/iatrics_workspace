import 'env.dart';

class AppConfig {
  static late String baseUrl;

  static void init(Environment env) {
    switch (env) {
      case Environment.dev:
        baseUrl = "http://localhost:5002";
        break;

      case Environment.test:
        baseUrl = "http://192.168.1.100:5002"; // ✅ CORRECT
        break;

      case Environment.prod:
        baseUrl = "https://api.iatrics.ng";
        break;
    }
  }
}