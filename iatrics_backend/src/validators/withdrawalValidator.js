const { body } = require("express-validator");

exports.withdrawalRules = [
  body("amount").isFloat({ min: 100 }),
  body("accountNumber").isLength({ min: 10, max: 10 }),
  body("bankCode").notEmpty(),
];