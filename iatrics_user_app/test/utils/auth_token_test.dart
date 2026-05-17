import 'package:flutter_test/flutter_test.dart';
import 'package:iatrics_user_app/utils/auth_token.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  group('AuthToken', () {
    setUp(() {
      SharedPreferences.setMockInitialValues({});
    });

    test('saves and reads token and user id', () async {
      await AuthToken.saveToken('token-123');
      await AuthToken.saveUserId('user-123');

      expect(await AuthToken.getToken(), 'token-123');
      expect(await AuthToken.getUserId(), 'user-123');
    });

    test('clear removes token and user id', () async {
      await AuthToken.saveToken('token-123');
      await AuthToken.saveUserId('user-123');

      await AuthToken.clear();

      expect(await AuthToken.getToken(), isNull);
      expect(await AuthToken.getUserId(), isNull);
    });
  });
}
