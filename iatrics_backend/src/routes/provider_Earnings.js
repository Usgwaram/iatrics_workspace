// routes/providerEarnings.js
const express = require("express");
const db = require("../db"); // adjust path to your DB setup
const router = express.Router();

router.get("/:providerId", async (req, res) => {
  const { providerId } = req.params;

  try {
    const result = await db.query(
      "SELECT COALESCE(SUM(amount), 0) AS total FROM earnings WHERE user_id = $1",
      [providerId]
    );
    res.json({ total: result.rows[0].total });
  } catch (error) {
    console.error("Error fetching provider earnings", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
