const { Subscription } = require("../models");

module.exports = async (req, res, next) => {
  // Admin bypass
  if (req.user.role === "admin") return next();

  const subscription = await Subscription.findOne({
    where: { userId: req.user.id },
    order: [["createdAt", "DESC"]],
  });

  if (!subscription) {
    return res.status(403).json({ message: "No active subscription" });
  }

  // Free plan allowed only for limited actions
  if (subscription.plan === "free") {
    return res.status(403).json({
      message: "Please upgrade your subscription to continue",
    });
  }

  // Check expiry
  if (subscription.endsAt && new Date(subscription.endsAt) < new Date()) {
    subscription.status = "expired";
    await subscription.save();

    return res.status(403).json({
      message: "Subscription expired. Please renew.",
    });
  }

  next();
};
