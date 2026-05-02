import '../../models/consultation_model.dart';

class ConsultationEngine {
  static bool canStartConsultation(String onboardingStep) {
    return onboardingStep == "APPROVED";
  }

  static ConsultationModel createSession({
    required int providerId,
    required int userId,
  }) {
    return ConsultationModel(
      id: DateTime.now().millisecondsSinceEpoch,
      providerId: providerId,
      userId: userId,
      status: "ONGOING",
      channelName: "consult_${DateTime.now().millisecondsSinceEpoch}",
    );
  }
}