const { Schedule } = require("../models");
const { getTransaction } = require("../utils/dbTransaction");

// CREATE
exports.create = async (req, res) => {
  try {
    const schedule = await Schedule.create(
      {
        providerId: req.body.providerId || req.user?.id,
        day: req.body.day,
        startTime: req.body.startTime,
        endTime: req.body.endTime,
      },
      { transaction: getTransaction() }
    );

    res.status(201).json(schedule);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getByProvider = async (req, res) => {
  try {
    const providerId = req.query.providerId || req.params.providerId;

    if (!providerId) {
      return res.status(400).json({ error: "providerId is required" });
    }

    const schedules = await Schedule.findAll({
      where: { providerId },
      transaction: getTransaction(),
    });

    res.json(schedules);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET ALL
exports.getAll = async (req, res) => {
  try {
    const schedules = await Schedule.findAll();
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET ONE
exports.getById = async (req, res) => {
  try {
    const schedule = await Schedule.findByPk(req.params.id);

    if (!schedule) {
      return res.status(404).json({ error: "Not found" });
    }

    res.json(schedule);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE
exports.update = async (req, res) => {
  try {
    const schedule = await Schedule.findByPk(req.params.id);

    if (!schedule) {
      return res.status(404).json({ error: "Not found" });
    }

    await schedule.update(req.body);
    res.json(schedule);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE
exports.delete = async (req, res) => {
  try {
    const schedule = await Schedule.findByPk(req.params.id);

    if (!schedule) {
      return res.status(404).json({ error: "Not found" });
    }

    await schedule.destroy();
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};