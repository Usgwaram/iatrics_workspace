const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/earnings/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await db.query(
      "SELECT level, amount, created_at FROM earnings WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );

    const total = result.rows.reduce((sum, r) => sum + parseFloat(r.amount), 0);

    res.json({
      total_earnings: total,
      breakdown: result.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error fetching earnings" });
  }
});

module.exports = router;
