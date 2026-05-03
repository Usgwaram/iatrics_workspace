const { Earning, User, Transaction } = require("../models");

exports.getUserEarnings = async (req, res) => {
  try {
    const earnings = await Earning.findAll({
      where: { userId: req.user.id },
      order: [["createdAt", "DESC"]],
    });

    res.json({ earnings });
  } catch (err) {
    console.error("USER EARNINGS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch earnings" });
  }
};

exports.getAdminEarnings = async (req, res) => {
  try {
    const earnings = await Earning.findAll({
      include: { model: User, attributes: ["fullName", "email"] },
      order: [["createdAt", "DESC"]],
    });

    res.json({ earnings });
  } catch (err) {
    console.error("ADMIN EARNINGS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch admin earnings" });
  }
};
