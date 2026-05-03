const { UserSubscription } = require('../models');

const TRIAL_DAYS = 14;

exports.grantProviderTrial = async (userId) => {
  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + TRIAL_DAYS);

  return await UserSubscription.create({
    userId,
    planId: 'provider_trial',
    status: 'active',
    isTrial: true,
    trialEndsAt,
  });
};
