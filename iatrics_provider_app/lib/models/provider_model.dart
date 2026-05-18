class ProviderModel {
  final int id;
  final String fullName;
  final String email;
  final String specialty;
  final String licenseNumber;
  final int? yearsOfExperience;
  final List<String> languages;
  final String onboardingStep;
  final bool isApproved;

  ProviderModel({
    required this.id,
    required this.fullName,
    required this.email,
    this.specialty = '',
    this.licenseNumber = '',
    this.yearsOfExperience,
    this.languages = const ['English'],
    this.onboardingStep = 'REGISTERED',
    this.isApproved = false,
  });

  factory ProviderModel.fromJson(Map<String, dynamic> json) {
    return ProviderModel(
      id: json['id'],
      fullName: json['fullName'] ?? '',
      email: json['email'] ?? '',
      specialty: json['specialty'] ?? '',
      licenseNumber: json['licenseNumber'] ?? '',
      yearsOfExperience: json['yearsOfExperience'],
      languages: ((json['languages'] as List?) ?? ['English'])
          .map((item) => item.toString())
          .toList(),
      onboardingStep: json['onboardingStep'] ?? 'REGISTERED',
      isApproved: json['isApproved'] ?? false,
    );
  }

  ProviderModel copyWith({
    int? id,
    String? fullName,
    String? email,
    String? specialty,
    String? licenseNumber,
    int? yearsOfExperience,
    List<String>? languages,
    String? onboardingStep,
    bool? isApproved,
  }) {
    return ProviderModel(
      id: id ?? this.id,
      fullName: fullName ?? this.fullName,
      email: email ?? this.email,
      specialty: specialty ?? this.specialty,
      licenseNumber: licenseNumber ?? this.licenseNumber,
      yearsOfExperience: yearsOfExperience ?? this.yearsOfExperience,
      languages: languages ?? this.languages,
      onboardingStep: onboardingStep ?? this.onboardingStep,
      isApproved: isApproved ?? this.isApproved,
    );
  }
}
