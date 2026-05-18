import 'package:flutter/material.dart';

import 'doctor_service.dart';

class InstantConsultationScreen extends StatefulWidget {
  final Map<String, dynamic> doctor;
  final int? estimatedPrice;

  const InstantConsultationScreen({
    super.key,
    required this.doctor,
    this.estimatedPrice,
  });

  @override
  State<InstantConsultationScreen> createState() =>
      _InstantConsultationScreenState();
}

class _InstantConsultationScreenState extends State<InstantConsultationScreen> {
  final symptomsController = TextEditingController();
  final service = DoctorService();
  bool isLoading = false;

  @override
  void dispose() {
    symptomsController.dispose();
    super.dispose();
  }

  Future<void> submit() async {
    setState(() => isLoading = true);

    try {
      await service.createInstantConsultation(
        providerId: widget.doctor['id'],
        symptoms: symptomsController.text.trim(),
      );

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Instant consultation created')),
      );
      Navigator.pop(context);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString().replaceAll('Exception:', ''))),
      );
    } finally {
      if (mounted) setState(() => isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Instant Consultation')),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            Text('Estimated price: ₦${widget.estimatedPrice ?? '--'}'),
            const SizedBox(height: 16),
            TextField(
              controller: symptomsController,
              maxLines: 4,
              decoration: const InputDecoration(
                labelText: 'Symptoms',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: isLoading ? null : submit,
              child: Text(isLoading ? 'Creating...' : 'Start Now'),
            ),
          ],
        ),
      ),
    );
  }
}
