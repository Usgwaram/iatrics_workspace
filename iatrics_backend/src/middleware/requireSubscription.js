const { UserSubscription } = require("../models");
const { Op } = require("sequelize");

module.exports = async (req, res, next) => {
  if (req.user.role !== "provider") return next();

  const sub = await UserSubscription.findOne({
    where: {
      userId: req.user.id,
      status: "active",
      [Op.or]: [
        { isTrial: false },
        { trialEndsAt: { [Op.gt]: new Date() } },
      ],
    },
  });

  if (!sub) {
    return res.status(403).json({
      message: "Subscription or free trial required",
      code: "SUB_REQUIRED",
    });
  }

  next();
};
