const express = require("express");
const router = express.Router();

const {
  createConsultation,
  getConsultations,
  getConsultationById,
  acceptConsultation,
  endConsultation
} = require("../controllers/consultationController");

const { protect } = require("../middleware/authMiddleware");

// ============================
// CREATE CONSULTATION
// ============================
router.post("/", protect, createConsultation);

// ============================
// GET ALL CONSULTATIONS
// ============================
router.get("/", protect, getConsultations);

// ============================
// GET SINGLE CONSULTATION
// ============================
router.get("/:id", protect, getConsultationById);

// ============================
// PROVIDER ACCEPTS
// ============================
router.post("/:id/accept", protect, acceptConsultation);

// ============================
// END CONSULTATION
// ============================
router.post("/:id/end", protect, endConsultation);

module.exports = router;