const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const feedbackController = require("../controllers/feedbackController");

router.post("/reviews", protect, feedbackController.createReview);
router.post("/complaints", protect, feedbackController.createComplaint);
router.get("/complaints", protect, feedbackController.getMyComplaints);

module.exports = router;
