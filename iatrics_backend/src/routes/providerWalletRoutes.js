const router = require("express").Router();
const controller = require("../controllers/providerWalletController");

router.get("/:providerId", controller.getProviderWallet);

module.exports = router;