// controllers/onboardingController.js
const { Provider } = require("../models");

exports.updateProfile = async (req, res) => {
  const { providerId } = req.params;
  const { specialty, licenseNumber, yearsOfExperience } = req.body;

  const provider = await Provider.findByPk(providerId);

  provider.specialty = specialty;
  provider.licenseNumber = licenseNumber;
  provider.yearsOfExperience = yearsOfExperience;
  provider.onboardingStep = "PROFILE_COMPLETED";

  await provider.save();

  res.json({ success: true, provider });
};

exports.uploadDocuments = async (req, res) => {
  const provider = await Provider.findByPk(req.params.providerId);

  provider.onboardingStep = "DOCUMENTS_SUBMITTED";

  await provider.save();

  res.json({ success: true });
};

exports.completeBankSetup = async (req, res) => {
  const provider = await Provider.findByPk(req.params.providerId);

  provider.onboardingStep = "BANK_SETUP_DONE";

  await provider.save();

  res.json({ success: true });
};

exports.approveProvider = async (req, res) => {
  const provider = await Provider.findByPk(req.params.providerId);

  provider.onboardingStep = "APPROVED";
  provider.isApproved = true;

  await provider.save();

  res.json({ success: true });
};