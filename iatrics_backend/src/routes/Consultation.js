const express = require("express");
const router = express.Router();

const consultationController = require("../controllers/consultationController");
const { protect } = require("../middleware/authMiddleware");

// CREATE CONSULTATION
router.post(
  "/",
  protect,
  consultationController.createConsultation
);

// GET ALL
router.get("/", protect, consultationController.getConsultations);

// GET BY ID
router.get("/:id", protect, consultationController.getConsultationById);

module.exports = router;