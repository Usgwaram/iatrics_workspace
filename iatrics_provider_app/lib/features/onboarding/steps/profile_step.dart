
import 'package:flutter/material.dart';
import '../../../models/provider_model.dart';

class ProfileStep extends StatelessWidget {
  final ProviderModel provider;

  const ProfileStep({super.key, required this.provider});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Complete Profile")),
      body: Center(
        child: ElevatedButton(
          onPressed: () async {
            // TODO: call backend → update onboardingStep to DOCUMENTS_SUBMITTED

            // DO NOT NAVIGATE
            // Instead trigger state refresh (via provider or controller)
          },
          child: const Text("Submit Profile"),
        ),
      ),
    );
  }
}