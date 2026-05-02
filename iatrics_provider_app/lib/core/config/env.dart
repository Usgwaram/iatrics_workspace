enum AppEnv { dev, test, staging, prod }

class Env {
  static late AppEnv mode;

  static String get baseUrl {
    switch (mode) {
      case AppEnv.dev:
        return "http://localhost:5002";

      case AppEnv.test:
        return "http://mock.api";

      case AppEnv.staging:
        return "https://staging.iatrics.ng";

      case AppEnv.prod:
        return "https://api.iatrics.ng";
    }
  }
}