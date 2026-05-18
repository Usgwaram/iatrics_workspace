const express = require("express");
const router = express.Router();

const { calculateConsultationPrice } = require("../services/pricingEngine");

router.post("/estimate", (req, res) => {
  const price = calculateConsultationPrice(req.body);

  res.json({
    success: true,
    price,
  });
});

module.exports = router;
