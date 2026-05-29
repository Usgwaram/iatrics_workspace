const express = require("express");
const router = express.Router();

const ctrl = require("../controllers/walletController");
const { protect } = require("../middleware/authMiddleware");

// GET BALANCE
router.get("/balance", protect, ctrl.getBalance);

// GET TRANSACTION HISTORY
router.get("/transactions", protect, ctrl.getTransactions);

// TOPUP
router.post("/topup", protect, ctrl.topupWallet);

// DEDUCT
router.post("/deduct", protect, ctrl.deductWallet);

// CREDIT
router.post("/credit", protect, ctrl.creditWallet);

// PAY PROVIDER AFTER CONSULTATION
router.post("/pay-provider", protect, ctrl.payProvider);

// ADMIN DEBUG
router.get("/balance/:email", ctrl.getBalanceByEmail);

module.exports = router;
