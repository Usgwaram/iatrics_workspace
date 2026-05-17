import 'package:flutter/material.dart';
import '../../features/consultation/incoming_call_screen.dart';
import 'call_service.dart';

class CallListener {
  static void start(BuildContext context) {
    CallService.instance.onIncomingCall = (data) {
      final channelName = data["channelName"];
      final callerId = data["callerId"];

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
