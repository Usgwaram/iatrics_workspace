import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:iatrics_user_app/features/consultation/consultation_detail_screen.dart';
import 'package:iatrics_user_app/features/consultation/user_consultation_history.dart';
import 'package:integration_test/integration_test.dart';
import 'package:flutter/material.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('user opens consultation history and views details',
      (tester) async {
    final client = MockClient((request) async {
      return http.Response(
        '[{"diagnosis":"Migraine","cost":1500,"createdAt":"2026-05-15"}]',
        200,
      );
    });

    await tester.pumpWidget(
      MaterialApp(
        home: UserConsultationHistory(
          userId: '1',
          client: client,
        ),
      ),
    );

    expect(find.byType(CircularProgressIndicator), findsOneWidget);

    await tester.pumpAndSettle();

    expect(find.text('My Consultations'), findsOneWidget);
    expect(find.text('Migraine'), findsOneWidget);

    await tester.tap(find.text('Migraine'));
    await tester.pumpAndSettle();

    expect(find.byType(ConsultationDetailScreen), findsOneWidget);
    expect(find.textContaining('Migraine'), findsOneWidget);
  });
}
