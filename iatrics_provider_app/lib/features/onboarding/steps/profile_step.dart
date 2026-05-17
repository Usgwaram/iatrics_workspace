import 'package:flutter/material.dart';
import '../../../models/provider_model.dart';
import '../onboarding_controller.dart';
import 'document_step.dart';

class ProfileStep extends StatefulWidget {
  final ProviderModel provider;
  final String token;
  final OnboardingController controller;

  const ProfileStep({
    super.key,
    required this.provider,
    required this.token,
    required this.controller,
  });

  @override
  State<ProfileStep> createState() => _ProfileStepState();
}

class _ProfileStepState extends State<ProfileStep> {
  final specialtyController = TextEditingController();
  final licenseController = TextEditingController();
  final experienceController = TextEditingController(text: '1');

  @override
  void initState() {
    super.initState();
    specialtyController.text = widget.provider.specialty;
    licenseController.text = widget.provider.licenseNumber;
    if (widget.provider.yearsOfExperience != null) {
      experienceController.text = widget.provider.yearsOfExperience.toString();
    }
  }

  @override
  void dispose() {
    specialtyController.dispose();
    licenseController.dispose();
    experienceController.dispose();
    super.dispose();
  }

  Future<void> submit() async {
    try {
      await widget.controller.submitProfile(
        providerId: widget.provider.id,
        token: widget.token,
        specialty: specialtyController.text.trim(),
        licenseNumber: licenseController.text.trim(),
        yearsOfExperience: int.tryParse(experienceController.text.trim()) ?? 0,
      );

      if (!mounted) return;

      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (_) => DocumentStep(
            providerId: widget.provider.id.toString(),
            token: widget.token,
            controller: widget.controller,
          ),
        ),
      );
    } catch (e) {
      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(widget.controller.error ?? 'Profile failed')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Complete Profile")),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            TextField(
              controller: specialtyController,
              decoration: const InputDecoration(labelText: "Specialty"),
            ),
            TextField(
              controller: licenseController,
              decoration: const InputDecoration(labelText: "License Number"),
            ),
            TextField(
              controller: experienceController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(labelText: "Years Experience"),
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: widget.controller.isLoading ? null : submit,
              child: Text(
                widget.controller.isLoading
                    ? "Submitting..."
                    : "Submit Profile",
              ),
            ),
          ],
        ),
      ),
    );
  }
}
