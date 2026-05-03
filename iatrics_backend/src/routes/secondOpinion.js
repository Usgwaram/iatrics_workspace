const express = require("express");
const router = express.Router();
const db = require("../config/database");

const { authenticate } = require("../middleware/authMiddleware");
const requirePremium = require("../middleware/requirePremium");

// 🔒 PREMIUM: Submit second opinion
router.post(
  "/submit",
  authenticate,
  requirePremium,
  async (req, res) => {
    try {
      const { userId, providerId, fileUrl, description } = req.body;

      const result = await db.query(
        `INSERT INTO second_opinions
         (user_id, provider_id, file_url, description)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [userId, providerId, fileUrl, description]
      );

      res.json({
        success: true,
        data: result.rows[0],
      });
    } catch (err) {
      console.error("Second opinion submit error:", err);
      res.status(500).json({ message: "Failed to submit second opinion" });
    }
  }
);

// 🔒 PREMIUM: Provider fetch
router.get(
  "/provider/:providerId",
  authenticate,
  requirePremium,
  async (req, res) => {
    try {
      const result = await db.query(
        `SELECT * FROM second_opinions WHERE provider_id = $1`,
        [req.params.providerId]
      );

      res.json({
        success: true,
        data: result.rows,
      });
    } catch (err) {
      console.error("Second opinion fetch error:", err);
      res.status(500).json({ message: "Failed to fetch second opinions" });
    }
  }
);

module.exports = router;
