const express = require("express");
const router = express.Router();
const { User } = require("../models");
const authController = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const auth = require("../middleware/auth");
const ctrl = require("../controllers/userController");

// AUTH
router.post("/register", authController.register);
router.post("/login", authController.login);

// PROTECTED

router.get("/profile", auth, ctrl.getProfile);
router.get("/me", protect, authController.getProfile);

router.get("/wallet/balance", async (req, res) => {
  const user = await User.findOne({
    where: { email: "test@example.com" },
  });

  res.json({ balance: user?.walletBalance || 0 });
});



router.get("/wallet/balance", async (req, res) => {
  try {
    const user = await User.findOne({
      where: { email: "test@example.com" }, // test mode
    });

    return res.json({
      balance: user?.walletBalance || 0,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch wallet" });
  }
});




// 💰 Wallet balance
router.get("/balance", async (req, res) => {
  try {
    const user = await User.findOne({
      where: { email: "test@example.com" }, // test user
    });

    return res.json({
      balance: user?.walletBalance || 0,
    });
  } catch (err) {
    console.error("Wallet error:", err);
    res.status(500).json({ error: "Failed to fetch wallet" });
  }
});

module.exports = router;