import 'package:flutter/material.dart';

import '../../core/call/call_service.dart';
import '../consultation/incoming_call_screen.dart';

class ProviderDashboardScreen extends StatefulWidget {
  final int providerId;

  const ProviderDashboardScreen({
    super.key,
    required this.providerId,
  });

  @override
  State<ProviderDashboardScreen> createState() =>
      _ProviderDashboardScreenState();
}

class _ProviderDashboardScreenState extends State<ProviderDashboardScreen> {
  @override
  void initState() {
    super.initState();

    CallService.instance.onIncomingCall = (data) {
      print("Incoming call: $data");

      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) => IncomingCallScreen(
            channelName: data['channelName'],
            callerId: int.parse(data['callerId'].toString()),
          ),
        ),
      );
    };
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Provider Dashboard"),
      ),
      body: Center(
        child: Text(
          "Welcome Provider ${widget.providerId}",
          style: const TextStyle(fontSize: 20),
        ),
      ),
    );
  }
}
