const router = require("express").Router();
const ctrl = require("../controllers/adminFinancialController");

const adminAuth = require("../middleware/adminAuth");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");

// 🔐 Protect all admin routes
router.use(adminAuth);

// 📊 SUMMARY
router.get("/summary", auth, authorize("admin"), ctrl.getSummary);

// 💰 FINANCE DATA
router.get("/transactions", ctrl.getTransactions);
router.get("/withdrawals", ctrl.getAllWithdrawals);

// ⚙️ WITHDRAWAL ACTIONS
router.post("/withdrawals/:id/approve", ctrl.approveWithdrawal);
router.post("/withdrawals/:id/reject", ctrl.rejectWithdrawal);

module.exports = router;