const router = require("express").Router();

const adminController = require("../controllers/adminController");
const adminAuth = require("../middleware/adminAuth");

router.use(adminAuth);

router.get("/summary", adminController.getSummary);
router.get("/users", adminController.getUsers);
router.get("/providers", adminController.getProviders);
router.post("/providers/:id/approve", adminController.approveProvider);
router.get("/transactions", adminController.getTransactions);
router.get("/withdrawals", adminController.getWithdrawals);
router.post("/withdrawals/:id/approve", adminController.approveWithdrawal);
router.post("/withdrawals/:id/reject", adminController.rejectWithdrawal);

module.exports = router;
