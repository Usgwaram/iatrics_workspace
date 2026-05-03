const { Subscription } = require("../models");

exports.getMySubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      where: { userId: req.user.id },
      order: [["createdAt", "DESC"]],
    });

    // Default = free if none found
    if (!subscription) {
      return res.json({
        plan: "free",
        status: "active",
        isPremium: false,
      });
    }

    const isPremium =
      subscription.plan === "premium" &&
      subscription.status === "active";

    res.json({
      plan: subscription.plan,
      status: subscription.status,
      startsAt: subscription.startsAt,
      endsAt: subscription.endsAt,
      isPremium,
    });
  } catch (err) {
    console.error("getMySubscription error:", err);
    res.status(500).json({ message: "Failed to load subscription" });
  }
};
