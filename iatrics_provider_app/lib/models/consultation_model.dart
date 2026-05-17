class ConsultationModel {
  final int id;
  final int providerId;
  final int userId;
  final String status;
  final String channelName;

  ConsultationModel({
    required this.id,
    required this.providerId,
    required this.userId,
    required this.status,
    required this.channelName,
  });
}
