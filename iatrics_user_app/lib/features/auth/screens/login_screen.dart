import 'package:flutter/material.dart';
import 'register_screen.dart';
import '../../consultation/incoming_call_screen.dart';

class LoginScreen extends StatelessWidget {
  const LoginScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = TextEditingController();

    return Scaffold(
      appBar: AppBar(title: const Text("Login")),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            TextField(
              controller: controller,
              decoration: const InputDecoration(labelText: "User ID"),
            ),
            const SizedBox(height: 20),

            ElevatedButton(
              onPressed: () {
                // TODO: integrate Auth later
                Navigator.pushReplacementNamed(context, '/home');
              },
              child: const Text("Login"),
            ),

            const SizedBox(height: 20),

            TextButton(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => const RegisterScreen(),
                  ),
                );
              },
              child: const Text("Don't have an account? Register"),
            ),
          ],
        ),
      ),
    );
  }
}