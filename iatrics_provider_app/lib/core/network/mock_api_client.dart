class MockApiClient {
  static Future<Map<String, dynamic>> post(
    String path,
    Map<String, dynamic> body,
  ) async {
    await Future.delayed(const Duration(milliseconds: 300));

    switch (path) {
      case "/api/auth/login":
        return {
          "token": "mock_token_123",
          "provider": {"id": 1, "name": "Test Provider"}
        };

      case "/api/consultations":
        return {"id": 101, "status": "PENDING"};

      default:
        return {"success": true};
    }
  }

  static Future<Map<String, dynamic>> get(String path) async {
    await Future.delayed(const Duration(milliseconds: 200));

    if (path.contains("/agora/token")) {
      return {"token": "mock_agora_token"};
    }

    if (path.contains("/consultations")) {
      return {"status": "IN_CALL"};
    }

    return {};
  }
}
