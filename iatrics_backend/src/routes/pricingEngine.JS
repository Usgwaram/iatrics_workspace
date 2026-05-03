// routes/pricingEngine.js
const express = require("express");
const router = express.Router();

router.post("/calculatePrice", (req, res) => {
  const { urgency, doctorRating, specialization, timeOfDay } = req.body;

  if (!urgency || !doctorRating || !specialization || !timeOfDay) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const basePrice = 3000; // NGN
  let score = 0;

  if (urgency === "high") score += 0.4;
  else if (urgency === "medium") score += 0.2;

  score += (doctorRating / 5) * 0.3;

  const specialistFields = ["Cardiologist", "Neurologist", "Oncologist"];
  if (specialistFields.includes(specialization)) score += 0.2;

  if (parseInt(timeOfDay) >= 18 && parseInt(timeOfDay) <= 21) score += 0.1;

  const finalPrice = Math.round(basePrice * (1 + score));

  return res.json({ price: finalPrice });
});

module.exports = router;
