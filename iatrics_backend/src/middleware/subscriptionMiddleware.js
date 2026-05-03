const { Subscription } = require("../models");

exports.requireActiveSubscription = (requiredPlan = "free") => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;

      const subscription = await Subscription.findOne({
        where: {
          userId,
          status: "active",
        },
      });

      if (!subscription) {
        return res.status(403).json({
          message: "No active subscription found",
        });
      }

      /* ----------------------------------
         Plan hierarchy
         free < premium < provider
      ---------------------------------- */
      const planRank = {
        free: 1,
        premium: 2,
        provider: 3,
      };

      const userRank = planRank[subscription.plan];
      const requiredRank = planRank[requiredPlan];

      if (!userRank || userRank < requiredRank) {
        return res.status(403).json({
          message: `Requires ${requiredPlan} subscription`,
        });
      }

      /* ----------------------------------
         Check expiration (if applicable)
      ---------------------------------- */
      if (subscription.endsAt && new Date(subscription.endsAt) < new Date()) {
        subscription.status = "expired";
        await subscription.save();

        return res.status(403).json({
          message: "Subscription has expired",
        });
      }

      // Attach subscription to request
      req.subscription = subscription;

      next();
    } catch (error) {
      console.error("🔥 SUBSCRIPTION MIDDLEWARE ERROR:", error);
      res.status(500).json({ message: "Subscription check failed" });
    }
  };
};
