const express = require("express");
const { sendConsultationReminders } = require("../jobs/email/consultationReminder.job");

const router = express.Router();

router.post("/consultation-reminders", async (req, res) => {
  const expectedSecret = process.env.CRON_SECRET;
  const providedSecret = req.headers["x-cron-secret"];

  if (!expectedSecret || providedSecret !== expectedSecret) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const results = await sendConsultationReminders();

  return res.json({
    success: true,
    sent: results.filter((result) => result.success).length,
    results,
  });
});

module.exports = router;
