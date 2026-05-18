import 'package:flutter/material.dart';

import 'doctor_profile_screen.dart';
import 'doctor_service.dart';

class AvailableDoctorsScreen extends StatefulWidget {
  const AvailableDoctorsScreen({super.key});

  @override
  State<AvailableDoctorsScreen> createState() => _AvailableDoctorsScreenState();
}

class _AvailableDoctorsScreenState extends State<AvailableDoctorsScreen> {
  final service = DoctorService();
  final languages = const ['Any', 'English', 'Hausa', 'Yoruba', 'Igbo'];
  final specialties = const [
    'Any',
    'General Medicine',
    'Cardiology',
    'Dermatology',
    'Pediatrics',
  ];

  String language = 'Any';
  String specialty = 'Any';
  bool onlineOnly = false;
  bool isLoading = true;
  List<Map<String, dynamic>> doctors = [];

  @override
  void initState() {
    super.initState();
    loadDoctors();
  }

  Future<void> loadDoctors() async {
    setState(() {
      isLoading = true;
    });

    try {
      final data = await service.listDoctors(
        language: language == 'Any' ? null : language,
        specialty: specialty == 'Any' ? null : specialty,
        onlineOnly: onlineOnly,
      );

      if (!mounted) return;
      setState(() {
        doctors = data;
        isLoading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        isLoading = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString().replaceAll('Exception:', ''))),
      );
    }
  }

  String doctorName(Map<String, dynamic> doctor) {
    final user = doctor['User'] as Map?;
    return user?['fullName'] ?? 'Doctor';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Choose Doctor')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(12),
            child: Wrap(
              spacing: 12,
              runSpacing: 8,
              crossAxisAlignment: WrapCrossAlignment.center,
              children: [
                DropdownButton<String>(
                  value: specialty,
                  items: specialties
                      .map((item) => DropdownMenuItem(
                            value: item,
                            child: Text(item),
                          ))
                      .toList(),
                  onChanged: (value) {
                    if (value == null) return;
                    setState(() => specialty = value);
                    loadDoctors();
                  },
                ),
                DropdownButton<String>(
                  value: language,
                  items: languages
                      .map((item) => DropdownMenuItem(
                            value: item,
                            child: Text(item),
                          ))
                      .toList(),
                  onChanged: (value) {
                    if (value == null) return;
                    setState(() => language = value);
                    loadDoctors();
                  },
                ),
                FilterChip(
                  selected: onlineOnly,
                  label: const Text('Online'),
                  onSelected: (value) {
                    setState(() => onlineOnly = value);
                    loadDoctors();
                  },
                ),
              ],
            ),
          ),
          Expanded(
            child: isLoading
                ? const Center(child: CircularProgressIndicator())
                : doctors.isEmpty
                    ? const Center(child: Text('No doctors available'))
                    : ListView.builder(
                        itemCount: doctors.length,
                        itemBuilder: (context, index) {
                          final doctor = doctors[index];
                          final doctorLanguages =
                              (doctor['languages'] as List?)?.join(', ') ??
                                  'English';

                          return ListTile(
                            leading: CircleAvatar(
                              child: Text(doctorName(doctor).characters.first),
                            ),
                            title: Text(doctorName(doctor)),
                            subtitle: Text(
                              '${doctor['specialty'] ?? 'General Medicine'} • $doctorLanguages',
                            ),
                            trailing: const Icon(Icons.chevron_right),
                            onTap: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => DoctorProfileScreen(
                                    doctorId: doctor['id'],
                                    initialDoctor: doctor,
                                  ),
                                ),
                              );
                            },
                          );
                        },
                      ),
          ),
        ],
      ),
    );
  }
}
