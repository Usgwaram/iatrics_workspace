const express = require("express");
const router = express.Router();
const paystackController = require("../controllers/paystackController");

router.post("/initialize", paystackController.initializePayment);

module.exports = router;