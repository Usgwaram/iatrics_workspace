const { Schedule } = require('../models');

module.exports = {
  async create(req, res) {
    try {
      const schedule = await Schedule.create(req.body);
      res.status(201).json(schedule);
    } catch (err) {
      res.status(500).json({ error: 'Failed to create schedule' });
    }
  },

  async getAll(req, res) {
    try {
      const schedules = await Schedule.findAll();
      res.json(schedules);
    } catch (err) {
      res.status(500).json({ error: 'Error fetching schedules' });
    }
  },

  async getById(req, res) {
    try {
      const schedule = await Schedule.findByPk(req.params.id);
      if (!schedule) return res.status(404).json({ error: 'Schedule not found' });
      res.json(schedule);
    } catch (err) {
      res.status(500).json({ error: 'Error retrieving schedule' });
    }
  },

  async update(req, res) {
    try {
      const { date, time, availability } = req.body;

      await Schedule.update(
        { date, time, availability },
        { where: { id } }
      );

      if (!updated) return res.status(404).json({ error: 'Schedule not found' });
      res.json({ message: 'Schedule updated' });
    } catch (err) {
      res.status(500).json({ error: 'Error updating schedule' });
    }
  },

  async delete(req, res) {
    try {
      const deleted = await Schedule.destroy({ where: { id: req.params.id } });
      if (!deleted) return res.status(404).json({ error: 'Schedule not found' });
      res.json({ message: 'Schedule deleted' });
    } catch (err) {
      res.status(500).json({ error: 'Error deleting schedule' });
    }
  }
};
