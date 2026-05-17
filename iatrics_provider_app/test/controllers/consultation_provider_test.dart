import 'package:flutter_test/flutter_test.dart';
import 'package:iatrics_provider_app/models/consultation_model.dart';
import 'package:iatrics_provider_app/providers/consultation_provider.dart';

void main() {
  group('ConsultationProvider', () {
    test('starts and ends active consultation session', () {
      final provider = ConsultationProvider();
      var notifications = 0;

      provider.addListener(() {
        notifications++;
      });

      final session = ConsultationModel(
        id: 101,
        providerId: 1,
        userId: 5,
        status: 'PENDING',
        channelName: 'channel-101',
      );

      provider.startSession(session);

      expect(provider.activeSession, session);
      expect(provider.activeSession?.channelName, 'channel-101');

      provider.endSession();

      expect(provider.activeSession, isNull);
      expect(notifications, 2);
    });
  });
}
