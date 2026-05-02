class ProviderModel {
  final int id;
  final String name;
  final String email;
  final String? onboardingStep;
  final String status;

  ProviderModel({
    required this.id,
    required this.name,
    required this.email,
    this.onboardingStep,
    required this.status,
  });

  factory ProviderModel.fromJson(Map<String, dynamic> json) {
    return ProviderModel(
      id: json['id'],
      name: json['name'],
      email: json['email'],
      onboardingStep: json['onboardingStep'],
      status: json['status'] ?? "PENDING",
    );
  }

  bool get isApproved => status == "APPROVED";
}