enum AppEnvironment { dev, local, staging, prod }

class AppEnvironmentConfig {
  static late AppEnvironment env;

  static String get baseUrl {
    switch (env) {
      case AppEnvironment.dev:
        return "http://localhost:5002";

      case AppEnvironment.local:
        return "http://host.docker.internal:5002";
    // or tunnel URL (recommended below)

      case AppEnvironment.staging:
        return "https://wok-capillary-conform.ngrok-free.dev";

      case AppEnvironment.prod:
        return "https://api.iatrics.ng";
    }
  }
}