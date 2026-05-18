// controllers/onboardingController.js
const { Provider } = require("../models");

exports.updateProfile = async (req, res) => {
  try {
    const { providerId } = req.params;
    const { specialty, licenseNumber, yearsOfExperience, languages } = req.body;

    const provider = await Provider.findByPk(providerId);

    if (!provider) {
      return res.status(404).json({ error: "Provider not found" });
    }

    provider.specialty = specialty ?? provider.specialty;
    provider.licenseNumber = licenseNumber ?? provider.licenseNumber;
    provider.yearsOfExperience =
      yearsOfExperience ?? provider.yearsOfExperience;
    provider.languages = Array.isArray(languages)
      ? languages
      : provider.languages;
    provider.onboardingStep = "PROFILE_COMPLETED";

    await provider.save();

    return res.json({ success: true, provider });
  } catch (err) {
    return res.status(500).json({ error: "Failed to update profile" });
  }
};

exports.uploadDocuments = async (req, res) => {
  try {
    const provider = await Provider.findByPk(req.params.providerId);

    if (!provider) {
      return res.status(404).json({ error: "Provider not found" });
    }

    provider.onboardingStep = "DOCUMENTS_SUBMITTED";

    await provider.save();

    return res.json({ success: true, provider });
  } catch (err) {
    return res.status(500).json({ error: "Failed to upload documents" });
  }
};

exports.completeBankSetup = async (req, res) => {
  try {
    const provider = await Provider.findByPk(req.params.providerId);

    if (!provider) {
      return res.status(404).json({ error: "Provider not found" });
    }

    provider.onboardingStep = "BANK_SETUP_DONE";

    await provider.save();

    return res.json({ success: true, provider });
  } catch (err) {
    return res.status(500).json({ error: "Failed to complete bank setup" });
  }
};

exports.approveProvider = async (req, res) => {
  try {
    const provider = await Provider.findByPk(req.params.providerId);

    if (!provider) {
      return res.status(404).json({ error: "Provider not found" });
    }

    provider.onboardingStep = "APPROVED";
    provider.isApproved = true;

    await provider.save();

    return res.json({ success: true, provider });
  } catch (err) {
    return res.status(500).json({ error: "Failed to approve provider" });
  }
};

exports.getStatus = async (req, res) => {
  try {
    const provider = await Provider.findByPk(req.params.providerId);

    if (!provider) {
      return res.status(404).json({ error: "Provider not found" });
    }

    return res.json({
      success: true,
      provider,
      onboardingStep: provider.onboardingStep,
      isApproved: provider.isApproved,
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch onboarding status" });
  }
};
