const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const auth = require("../middleware/auth");
const ctrl = require("../controllers/userController");
const walletController = require("../controllers/walletController");

// AUTH
router.post("/register", authController.register);
router.post("/login", authController.login);

// PROTECTED

router.get("/profile", auth, ctrl.getProfile);
router.get("/me", protect, authController.getProfile);

router.get("/wallet/balance", protect, walletController.getBalance);
router.get("/balance", protect, walletController.getBalance);

module.exports = router;
