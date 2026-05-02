import 'package:flutter/material.dart';
import '../../core/services/call_service.dart';
import '../consultation/incoming_call_screen.dart';

class ProviderDashboardScreen extends StatefulWidget {
  final String providerId;

  const ProviderDashboardScreen({
    super.key,
    required this.providerId,
  });

  @override
  State<ProviderDashboardScreen> createState() =>
      _ProviderDashboardScreenState();
}

class _ProviderDashboardScreenState
    extends State<ProviderDashboardScreen> {

  @override
  void initState() {
    super.initState();

    // 👂 LISTEN FOR INCOMING CALLS
    CallService().onIncomingCall((data) {
      print("📞 Incoming call: $data");

      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) => IncomingCallScreen(
            userId: data['userId'],
            channelName: data['channelName'],
          ),
        ),
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Provider Dashboard"),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Card(
              child: ListTile(
                leading: const Icon(Icons.account_circle),
                title: const Text("Profile"),
                subtitle: Text("Provider ID: ${widget.providerId}"),
              ),
            ),

            const SizedBox(height: 16),

            Card(
              child: ListTile(
                leading: const Icon(Icons.video_call),
                title: const Text("Start Consultation"),
                onTap: () {
                  // optional manual start
                },
              ),
            ),

            const SizedBox(height: 16),

            Card(
              child: ListTile(
                leading: const Icon(Icons.account_balance_wallet),
                title: const Text("Wallet"),
                onTap: () {},
              ),
            ),

            const SizedBox(height: 16),

            Card(
              child: ListTile(
                leading: const Icon(Icons.logout),
                title: const Text("Logout"),
                onTap: () {
                  Navigator.pushReplacementNamed(context, '/login');
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}