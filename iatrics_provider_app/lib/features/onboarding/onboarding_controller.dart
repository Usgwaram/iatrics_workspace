import 'package:flutter/material.dart';

import '../../models/provider_model.dart';
import '../../services/onboarding_service.dart';

class OnboardingController extends ChangeNotifier {
  final OnboardingService service;

  OnboardingController({
    OnboardingService? service,
  }) : service = service ?? OnboardingService();

  ProviderModel? provider;
  bool isLoading = false;
  String? error;

  void setProvider(ProviderModel data) {
    provider = data;
    notifyListeners();
  }

  Future<void> loadStatus({
    required int providerId,
    required String token,
  }) async {
    await _run(() async {
      provider = await service.getStatus(providerId: providerId, token: token);
    });
  }

  Future<void> submitProfile({
    required int providerId,
    required String token,
    required String specialty,
    required String licenseNumber,
    required int yearsOfExperience,
  }) async {
    await _run(() async {
      provider = await service.submitProfile(
        providerId: providerId,
        token: token,
        specialty: specialty,
        licenseNumber: licenseNumber,
        yearsOfExperience: yearsOfExperience,
      );
    });
  }

  Future<void> submitDocuments({
    required int providerId,
    required String token,
    String? licenseDocumentUrl,
  }) async {
    await _run(() async {
      provider = await service.submitDocuments(
        providerId: providerId,
        token: token,
        licenseDocumentUrl: licenseDocumentUrl,
      );
    });
  }

  Future<void> submitBankSetup({
    required int providerId,
    required String token,
    required String bankCode,
    required String accountNumber,
    required String accountName,
  }) async {
    await _run(() async {
      provider = await service.submitBankSetup(
        providerId: providerId,
        token: token,
        bankCode: bankCode,
        accountNumber: accountNumber,
        accountName: accountName,
      );
    });
  }

  void clear() {
    provider = null;
    error = null;
    notifyListeners();
  }

  Future<void> _run(Future<void> Function() action) async {
    isLoading = true;
    error = null;
    notifyListeners();

    try {
      await action();
    } catch (e) {
      error = e.toString().replaceAll('Exception:', '').trim();
      rethrow;
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }
}
