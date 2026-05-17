const express = require("express");
const router = express.Router();

const scheduleController = require("../controllers/scheduleController");

// CREATE
router.post("/", scheduleController.create);

// GET ALL
router.get("/", scheduleController.getAll);

// GET BY PROVIDER
router.get("/provider", scheduleController.getByProvider);

// GET ONE
router.get("/:id", scheduleController.getById);

// UPDATE
router.put("/:id", scheduleController.update);

// DELETE
router.delete("/:id", scheduleController.delete);

module.exports = router;