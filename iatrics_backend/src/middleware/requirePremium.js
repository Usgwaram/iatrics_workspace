const { Subscription } = require("../models");

module.exports = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOne({
      where: { userId: req.user.id },
      order: [["createdAt", "DESC"]],
    });

    // Default = FREE user
    if (!subscription) {
      return res.status(403).json({
        message: "Premium subscription required",
      });
    }

    const isPremium =
      subscription.plan === "premium" &&
      subscription.status === "active";

    if (!isPremium) {
      return res.status(403).json({
        message: "Premium subscription required",
      });
    }

    next();
  } catch (err) {
    console.error("requirePremium error:", err);
    res.status(500).json({ message: "Subscription check failed" });
  }
};
