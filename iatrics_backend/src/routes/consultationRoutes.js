const express = require("express");
const router = express.Router();

const controller = require("../controllers/consultationController");
const { protect } = require("../middleware/authMiddleware");

// CREATE
router.post("/", protect, controller.createConsultation);

// GET ALL
router.get("/", protect, controller.getConsultations);

// GET ONE
router.get("/:id", protect, controller.getConsultationById);

module.exports = router;