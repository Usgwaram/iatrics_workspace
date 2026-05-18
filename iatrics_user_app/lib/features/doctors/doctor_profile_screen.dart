import 'package:flutter/material.dart';

import 'book_appointment_screen.dart';
import 'doctor_service.dart';
import 'instant_consultation_screen.dart';

class DoctorProfileScreen extends StatefulWidget {
  final int doctorId;
  final Map<String, dynamic>? initialDoctor;

  const DoctorProfileScreen({
    super.key,
    required this.doctorId,
    this.initialDoctor,
  });

  @override
  State<DoctorProfileScreen> createState() => _DoctorProfileScreenState();
}

class _DoctorProfileScreenState extends State<DoctorProfileScreen> {
  final service = DoctorService();
  Map<String, dynamic>? doctor;
  int? instantPrice;
  int? bookingPrice;
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    doctor = widget.initialDoctor;
    loadDoctor();
  }

  Future<void> loadDoctor() async {
    try {
      final data = await service.getDoctorProfile(widget.doctorId);
      final instant = await service.estimatePrice(
        doctor: data,
        type: 'instant',
      );
      final booking = await service.estimatePrice(
        doctor: data,
        type: 'booking',
      );

      if (!mounted) return;
      setState(() {
        doctor = data;
        instantPrice = instant;
        bookingPrice = booking;
        isLoading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        isLoading = false;
      });
    }
  }

  String get name {
    final user = doctor?['User'] as Map?;
    return user?['fullName'] ?? 'Doctor';
  }

  @override
  Widget build(BuildContext context) {
    final data = doctor;

    return Scaffold(
      appBar: AppBar(title: Text(name)),
      body: isLoading && data == null
          ? const Center(child: CircularProgressIndicator())
          : Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    name,
                    style: Theme.of(context).textTheme.headlineSmall,
                  ),
                  const SizedBox(height: 8),
                  Text(data?['specialty'] ?? 'General Medicine'),
                  const SizedBox(height: 8),
                  Text(
                    '${data?['yearsOfExperience'] ?? 0} years experience',
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Languages: ${((data?['languages'] as List?) ?? [
                          'English'
                        ]).join(', ')}',
                  ),
                  const SizedBox(height: 24),
                  ListTile(
                    contentPadding: EdgeInsets.zero,
                    title: const Text('Instant consultation'),
                    subtitle: Text('Estimated price: ₦${instantPrice ?? '--'}'),
                    trailing: const Icon(Icons.flash_on),
                    onTap: data == null
                        ? null
                        : () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => InstantConsultationScreen(
                                  doctor: data,
                                  estimatedPrice: instantPrice,
                                ),
                              ),
                            );
                          },
                  ),
                  ListTile(
                    contentPadding: EdgeInsets.zero,
                    title: const Text('Book appointment'),
                    subtitle: Text('Estimated price: ₦${bookingPrice ?? '--'}'),
                    trailing: const Icon(Icons.calendar_month),
                    onTap: data == null
                        ? null
                        : () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => BookAppointmentScreen(
                                  doctor: data,
                                  estimatedPrice: bookingPrice,
                                ),
                              ),
                            );
                          },
                  ),
                ],
              ),
            ),
    );
  }
}
