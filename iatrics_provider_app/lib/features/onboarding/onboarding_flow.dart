import 'package:flutter/material.dart';
import '../../models/provider_model.dart';
import 'steps/document_step.dart';
import 'steps/bank_step.dart';

Widget resolveOnboarding(ProviderModel provider) {
  final providerId = provider.id.toString();

  switch (provider.onboardingStep?.toUpperCase()) {
    case "DOCUMENT":
      return DocumentStep(providerId: providerId);

    case "BANK":
      return BankStep(providerId: providerId);

    default:
      return DocumentStep(providerId: providerId);
  }
}