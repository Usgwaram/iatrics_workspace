const { Earning } = require("../models");

exports.getRevenueSummary = async (req, res) => {
  try {
    const total = await Earning.sum("amount");

    const byLevel = await Earning.findAll({
      attributes: ["level", "amount"],
    });

    res.json({
      totalRevenue: total || 0,
      breakdown: byLevel,
    });
  } catch (err) {
    res.status(500).json({ message: "Revenue error" });
  }
};