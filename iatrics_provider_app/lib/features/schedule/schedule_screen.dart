import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

class ProviderRegisterScreen extends StatefulWidget {
  const ProviderRegisterScreen({super.key});

  @override
  State<ProviderRegisterScreen> createState() => _ProviderRegisterScreenState();
}

class _ProviderRegisterScreenState extends State<ProviderRegisterScreen> {
  final nameCtrl = TextEditingController();
  final emailCtrl = TextEditingController();
  final phoneCtrl = TextEditingController();
  final passCtrl = TextEditingController();
  final specialtyCtrl = TextEditingController();

  bool loading = false;

  Future<void> registerProvider() async {
    setState(() => loading = true);

    final res = await http.post(
      Uri.parse("http://YOUR_IP:5002/api/providers/register"),
      headers: {"Content-Type": "application/json"},
      body: jsonEncode({
        "name": nameCtrl.text,
        "email": emailCtrl.text,
        "phone": phoneCtrl.text,
        "password": passCtrl.text,
        "specialty": specialtyCtrl.text,
      }),
    );

    setState(() => loading = false);

    if (res.statusCode == 200 || res.statusCode == 201) {
      Navigator.pop(context);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Provider registration failed")),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Provider Registration")),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            TextField(
                controller: nameCtrl,
                decoration: const InputDecoration(labelText: "Name")),
            TextField(
                controller: emailCtrl,
                decoration: const InputDecoration(labelText: "Email")),
            TextField(
                controller: phoneCtrl,
                decoration: const InputDecoration(labelText: "Phone")),
            TextField(
                controller: specialtyCtrl,
                decoration: const InputDecoration(labelText: "Specialty")),
            TextField(
                controller: passCtrl,
                obscureText: true,
                decoration: const InputDecoration(labelText: "Password")),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: loading ? null : registerProvider,
              child: Text(loading ? "Registering..." : "Register Provider"),
            ),
          ],
        ),
      ),
    );
  }
}
