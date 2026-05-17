import 'package:flutter/material.dart';

import '../../models/provider_model.dart';
import 'onboarding_controller.dart';
import 'steps/approval_waiting.dart';
import 'steps/bank_step.dart';
import 'steps/document_step.dart';
import 'steps/profile_step.dart';

class OnboardingFlow extends StatefulWidget {
  final int providerId;
  final String token;
  final OnboardingController? controller;

  const OnboardingFlow({
    super.key,
    this.providerId = 1,
    this.token = 'demo-token',
    this.controller,
  });

  @override
  State<OnboardingFlow> createState() => _OnboardingFlowState();
}

class _OnboardingFlowState extends State<OnboardingFlow> {
  late final OnboardingController controller;

  @override
  void initState() {
    super.initState();
    controller = widget.controller ?? OnboardingController();
    controller.addListener(_onControllerChanged);
    controller
        .loadStatus(
          providerId: widget.providerId,
          token: widget.token,
        )
        .catchError((_) {});
  }

  @override
  void dispose() {
    controller.removeListener(_onControllerChanged);
    if (widget.controller == null) {
      controller.dispose();
    }
    super.dispose();
  }

  void _onControllerChanged() {
    if (mounted) setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    if (controller.isLoading && controller.provider == null) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    final provider = controller.provider ??
        ProviderModel(
          id: widget.providerId,
          fullName: '',
          email: '',
        );

    switch (provider.onboardingStep) {
      case 'PROFILE_COMPLETED':
        return DocumentStep(
          providerId: provider.id.toString(),
          token: widget.token,
          controller: controller,
        );
      case 'DOCUMENTS_SUBMITTED':
        return BankStep(
          providerId: provider.id.toString(),
          token: widget.token,
          controller: controller,
        );
      case 'BANK_SETUP_DONE':
      case 'UNDER_REVIEW':
      case 'APPROVED':
        return WaitingApprovalScreen(
          isApproved:
              provider.isApproved || provider.onboardingStep == 'APPROVED',
        );
      case 'REGISTERED':
      default:
        return ProfileStep(
          provider: provider,
          token: widget.token,
          controller: controller,
        );
    }
  }
}
