import 'package:flutter/material.dart';
import '../models/consultation_model.dart';

class ConsultationProvider extends ChangeNotifier {
  ConsultationModel? activeSession;

  void startSession(ConsultationModel session) {
    activeSession = session;
    notifyListeners();
  }

  void endSession() {
    activeSession = null;
    notifyListeners();
  }
}