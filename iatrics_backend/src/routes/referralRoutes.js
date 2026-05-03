const express = require('express');
const router = express.Router();
const db = require('../../db');

function generateReferralCode(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// POST /referrals/register
router.post('/register', async (req, res) => {
  const { name, email, password, referred_by } = req.body;
  const referral_code = generateReferralCode();

  try {
    const result = await db.query(
      "INSERT INTO users (name, email, password, referral_code, referred_by) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, email, password, referral_code, referred_by || null]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed.' });
  }
});

// POST /referrals/commission
router.post('/commission', async (req, res) => {
  const { payerUserId, amount } = req.body;
  const commissionRates = [0, 0.10, 0.05, 0.02, 0.01, 0.005];

  try {
    let currentUser = payerUserId;

    for (let level = 1; level <= 5; level++) {
      const refRes = await db.query(
        "SELECT referred_by FROM users WHERE referral_code = (SELECT referred_by FROM users WHERE id = $1)",
        [currentUser]
      );

      if (!refRes.rows.length || !refRes.rows[0].referred_by) break;

      const refUser = await db.query("SELECT id FROM users WHERE referral_code = $1", [refRes.rows[0].referred_by]);
      if (!refUser.rows.length) break;

      currentUser = refUser.rows[0].id;
      const commission = amount * commissionRates[level];

      await db.query("INSERT INTO earnings (user_id, amount, level, source_user_id) VALUES ($1, $2, $3, $4)",
        [currentUser, commission, level, payerUserId]);
    }

    res.json({ message: 'Commission distributed' });
  } catch (error) {
    console.error('Commission error:', error);
    res.status(500).json({ error: 'Commission distribution failed.' });
  }
});

module.exports = router;
