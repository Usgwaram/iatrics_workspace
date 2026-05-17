enum AppEnv { dev, test, staging, prod }

class Env {
  static late AppEnv mode;
  static const _definedBaseUrl = String.fromEnvironment('API_BASE_URL');

  static String get baseUrl {
    if (_definedBaseUrl.isNotEmpty) {
      return _definedBaseUrl;
    }

    switch (mode) {
      case AppEnv.dev:
        return "https://api.iatrics.ng";

      case AppEnv.test:
        return "https://api.iatrics.ng";

      case AppEnv.staging:
        return "https://staging.iatrics.ng";

      case AppEnv.prod:
        return "https://api.iatrics.ng";
    }
  }
}
