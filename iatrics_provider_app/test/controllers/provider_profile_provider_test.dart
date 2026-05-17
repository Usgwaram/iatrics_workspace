import 'package:flutter_test/flutter_test.dart';
import 'package:iatrics_provider_app/models/provider_model.dart';
import 'package:iatrics_provider_app/providers/provider_profile_provider.dart';

void main() {
  group('ProviderProfileProvider', () {
    test('sets, updates, and clears provider profile', () {
      final provider = ProviderProfileProvider();
      var notifications = 0;

      provider.addListener(() {
        notifications++;
      });

      provider.setProvider(
        ProviderModel(
          id: 1,
          fullName: 'Original Name',
          email: 'provider@test.com',
        ),
      );

      provider.updateProfile(fullName: 'Updated Name');

      expect(provider.provider?.id, 1);
      expect(provider.provider?.fullName, 'Updated Name');
      expect(provider.provider?.email, 'provider@test.com');

      provider.clearProvider();

      expect(provider.provider, isNull);
      expect(notifications, 3);
    });

    test('ignores profile updates before provider is set', () {
      final provider = ProviderProfileProvider();
      var notifications = 0;

      provider.addListener(() {
        notifications++;
      });

      provider.updateProfile(fullName: 'Ignored');

      expect(provider.provider, isNull);
      expect(notifications, 0);
    });
  });
}
