const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const ctrl = require("../controllers/walletController");

// 💰 Get balance
router.get("/balance", auth, ctrl.getBalance);

// 💰 Topup wallet
router.post("/topup", auth, ctrl.topupWallet);

// 💰 Deduct wallet
router.post("/deduct", auth, ctrl.deductWallet);

// 💰 Credit wallet
router.post("/credit", auth, ctrl.creditWallet);

// 🔍 Balance by email (admin/debug)
router.get("/balance/:email", ctrl.getBalanceByEmail);

module.exports = router;