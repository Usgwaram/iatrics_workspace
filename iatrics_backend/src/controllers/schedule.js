const { Schedule } = require('../models');

exports.create = async (req, res) => {
  try {
    const s = await Schedule.create({ ...req.body, providerId: req.user.id });
    res.status(201).json(s);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create schedule', error: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const all = await Schedule.findAll({ where: { providerId: req.user.id } });
    res.json(all);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching schedule' });
  }
};

exports.update = async (req, res) => {
  try {
    const s = await Schedule.findByPk(req.params.id);
    if (!s || s.providerId !== req.user.id) return res.status(404).json({ message: 'Not found' });
    const { date, time, availability } = req.body;

    await s.update({ date, time, availability });
    res.json(s);
  } catch (err) {
    res.status(500).json({ message: 'Update error' });
  }
};

exports.delete = async (req, res) => {
  try {
    const s = await Schedule.findByPk(req.params.id);
    if (!s || s.providerId !== req.user.id) return res.status(404).json({ message: 'Not found' });
    await s.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Delete error' });
  }
};
