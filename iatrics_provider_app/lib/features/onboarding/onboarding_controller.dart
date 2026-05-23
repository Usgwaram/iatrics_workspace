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
  bool _isDisposed = false;

  void setProvider(ProviderModel data) {
    if (_isDisposed) return;
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
    List<String> languages = const ['English'],
  }) async {
    await _run(() async {
      provider = await service.submitProfile(
        providerId: providerId,
        token: token,
        specialty: specialty,
        licenseNumber: licenseNumber,
        yearsOfExperience: yearsOfExperience,
        languages: languages,
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
    if (_isDisposed) return;
    provider = null;
    error = null;
    notifyListeners();
  }

  Future<void> _run(Future<void> Function() action) async {
    if (_isDisposed) return;
    isLoading = true;
    error = null;
    notifyListeners();

    try {
      await action();
    } catch (e) {
      if (_isDisposed) rethrow;
      error = e.toString().replaceAll('Exception:', '').trim();
      rethrow;
    } finally {
      if (_isDisposed) return;
      isLoading = false;
      notifyListeners();
    }
  }

  @override
  void dispose() {
    _isDisposed = true;
    super.dispose();
  }
}
