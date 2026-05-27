import 'package:flutter/material.dart';
import 'services/agora_service.dart';
import 'core/init/app_initializer.dart';
import 'core/call/call_service.dart';
import 'features/consultation/incoming_call_screen.dart';

class AppRoot extends StatefulWidget {
  final Widget child;
  final String userId;
  final bool enableExternalServices;

  const AppRoot({
    super.key,
    required this.child,
    required this.userId,
    this.enableExternalServices = true,
  });

  @override
  State<AppRoot> createState() => _AppRootState();
}

class _AppRootState extends State<AppRoot> with WidgetsBindingObserver {
  @override
  void initState() {
    super.initState();

    WidgetsBinding.instance.addObserver(this);

    if (!widget.enableExternalServices) return;

    try {
      // INIT SOCKET + CALL ONCE
      AppInitializer.init(
        userId: widget.userId,
        role: "PROVIDER",
      );
    } catch (error) {
      debugPrint("Provider app initialization skipped: $error");
    }

    // LISTENER (VERY IMPORTANT)
    CallService.instance.onIncomingCall = (data) async {
      if (!mounted) return;

      final channel = data["channelName"]?.toString() ?? "";
      final callerId = int.tryParse(data["callerId"]?.toString() ?? "") ??
          int.tryParse(data["userId"]?.toString() ?? "") ??
          0;
      final providerId = int.tryParse(data["providerId"]?.toString() ?? "") ??
          int.tryParse(widget.userId) ??
          0;

      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) => IncomingCallScreen(
            channelName: channel,
            callerId: callerId,
            providerId: providerId,
          ),
        ),
      );
    };

    // INIT AGORA ONCE
    AgoraService.instance.init().catchError((error) {
      debugPrint("Agora initialization skipped: $error");
    });
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return widget.child;
  }
}
