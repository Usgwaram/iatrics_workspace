enum AppEnvironment { dev, local, staging, prod }

class AppEnvironmentConfig {
  static late AppEnvironment env;
  static const _definedBaseUrl = String.fromEnvironment('API_BASE_URL');

  static String get baseUrl {
    if (_definedBaseUrl.isNotEmpty) {
      return _definedBaseUrl;
    }

    switch (env) {
      case AppEnvironment.dev:
        return "https://api.iatrics.ng";

      case AppEnvironment.local:
        return "https://api.iatrics.ng";

      case AppEnvironment.staging:
        return "https://staging.iatrics.ng";

      case AppEnvironment.prod:
        return "https://api.iatrics.ng";
    }
  }
}
