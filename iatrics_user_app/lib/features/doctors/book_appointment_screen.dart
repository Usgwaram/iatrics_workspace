import 'package:flutter/material.dart';

import 'doctor_service.dart';

class BookAppointmentScreen extends StatefulWidget {
  final Map<String, dynamic> doctor;
  final int? estimatedPrice;

  const BookAppointmentScreen({
    super.key,
    required this.doctor,
    this.estimatedPrice,
  });

  @override
  State<BookAppointmentScreen> createState() => _BookAppointmentScreenState();
}

class _BookAppointmentScreenState extends State<BookAppointmentScreen> {
  final symptomsController = TextEditingController();
  final timeController = TextEditingController(text: '10:00');
  final service = DoctorService();
  DateTime selectedDate = DateTime.now().add(const Duration(days: 1));
  bool isLoading = false;

  @override
  void dispose() {
    symptomsController.dispose();
    timeController.dispose();
    super.dispose();
  }

  Future<void> pickDate() async {
    final date = await showDatePicker(
      context: context,
      initialDate: selectedDate,
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 90)),
    );

    if (date != null) {
      setState(() => selectedDate = date);
    }
  }

  Future<void> submit() async {
    setState(() => isLoading = true);

    try {
      await service.createBookingConsultation(
        providerId: widget.doctor['id'],
        symptoms: symptomsController.text.trim(),
        appointmentDate: selectedDate.toIso8601String().split('T').first,
        appointmentTime: timeController.text.trim(),
      );

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Appointment booked')),
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
      appBar: AppBar(title: const Text('Book Appointment')),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            Text('Estimated price: ₦${widget.estimatedPrice ?? '--'}'),
            const SizedBox(height: 16),
            ListTile(
              contentPadding: EdgeInsets.zero,
              title: const Text('Date'),
              subtitle: Text(selectedDate.toIso8601String().split('T').first),
              trailing: const Icon(Icons.calendar_month),
              onTap: pickDate,
            ),
            TextField(
              controller: timeController,
              decoration: const InputDecoration(labelText: 'Time'),
            ),
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
              child: Text(isLoading ? 'Booking...' : 'Book Appointment'),
            ),
          ],
        ),
      ),
    );
  }
}
