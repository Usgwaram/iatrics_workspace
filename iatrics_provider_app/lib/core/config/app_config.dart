class AppConfig {
  static const String appName = "Iatrics Provider";

  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'https://api.iatrics.ng',
  );
}
