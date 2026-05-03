const { Consultation } = require("../models");

async function detectAbuse(userId) {
  const lastHourCalls = await Consultation.count({
    where: {
      userId,
      createdAt: {
        [require("sequelize").Op.gte]: new Date(Date.now() - 3600000),
      },
    },
  });

  if (lastHourCalls > 5) {
    console.log("🚨 Possible abuse detected for user:", userId);
    return true;
  }

  return false;
}

module.exports = { detectAbuse };