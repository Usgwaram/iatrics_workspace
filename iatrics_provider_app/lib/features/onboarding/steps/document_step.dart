import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../onboarding_controller.dart';
import 'bank_step.dart';

class DocumentStep extends StatefulWidget {
  final String providerId;
  final String token;
  final OnboardingController controller;

  const DocumentStep({
    super.key,
    required this.providerId,
    required this.token,
    required this.controller,
  });

  @override
  State<DocumentStep> createState() => _DocumentStepState();
}

class _DocumentStepState extends State<DocumentStep> {
  final picker = ImagePicker();
  XFile? selectedFile;
  bool isUploading = false;

  Future<void> pickDocument() async {
    final file = await picker.pickMedia();

    if (file == null) return;

    setState(() {
      selectedFile = file;
    });
  }

  Future<void> submit(BuildContext context) async {
    try {
      setState(() {
        isUploading = true;
      });

      final providerIdValue = int.parse(widget.providerId);
      String? uploadedDocumentUrl;

      if (selectedFile != null) {
        uploadedDocumentUrl =
            await widget.controller.service.uploadProviderDocument(
          providerId: providerIdValue,
          token: widget.token,
          filePath: selectedFile!.path,
        );
      }

      await widget.controller.submitDocuments(
        providerId: providerIdValue,
        token: widget.token,
        licenseDocumentUrl: uploadedDocumentUrl ?? "submitted",
      );

      if (!context.mounted) return;

      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (_) => BankStep(
            providerId: widget.providerId,
            token: widget.token,
            controller: widget.controller,
          ),
        ),
      );
    } catch (e) {
      if (!context.mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            widget.controller.error ??
                e.toString().replaceAll('Exception:', ''),
          ),
        ),
      );
    } finally {
      if (mounted) {
        setState(() {
          isUploading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isLoading = widget.controller.isLoading || isUploading;

    return Scaffold(
      appBar: AppBar(title: const Text("Upload Documents")),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          const Text("Medical license or verification document"),
          const SizedBox(height: 12),
          OutlinedButton.icon(
            onPressed: isLoading ? null : pickDocument,
            icon: const Icon(Icons.upload_file),
            label: const Text("Choose File"),
          ),
          if (selectedFile != null) ...[
            const SizedBox(height: 12),
            Text(selectedFile!.name),
          ],
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: isLoading ? null : () => submit(context),
            child: Text(
              isLoading ? "Submitting..." : "Submit Documents",
            ),
          ),
        ],
      ),
    );
  }
}
