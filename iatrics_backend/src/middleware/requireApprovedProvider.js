exports.requireApprovedProvider = async (req, res, next) => {
  const provider = await Provider.findByPk(req.user.providerId);

  if (provider.onboardingStep !== "APPROVED") {
    return res.status(403).json({
      message: "Complete onboarding first",
      step: provider.onboardingStep,
    });
  }

  next();
};