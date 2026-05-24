import 'package:flutter/material.dart';
import '../../features/consultation/incoming_call_screen.dart';
import 'call_service.dart';

class CallListener {
  static void start(BuildContext context) {
    CallService.instance.onIncomingCall = (data) {
      final channelName = data["channelName"];
      final callerId = int.tryParse(data["callerId"]?.toString() ?? "") ??
          int.tryParse(data["userId"]?.toString() ?? "") ??
          0;

      Navigator.of(context).push(
        MaterialPageRoute(
          builder: (_) => IncomingCallScreen(
            channelName: channelName,
            callerId: callerId,
          ),
        ),
      );
    };
  }
}
