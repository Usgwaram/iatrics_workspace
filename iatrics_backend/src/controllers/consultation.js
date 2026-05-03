const { Consultation } = require('../models');

exports.createConsultation = async (req, res) => {
  try {
    const consultation = await Consultation.create({
      providerId: req.body.providerId,
      userId: req.user.id,
      scheduledAt: req.body.scheduledAt,
      duration: req.body.duration,
      status: 'scheduled',
      notes: req.body.notes
    });
    res.status(201).json(consultation);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create consultation', details: err.message });
  }
};

exports.getAllConsultations = async (req, res) => {
  try {
    const consultations = await Consultation.findAll();
    res.json(consultations);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch consultations' });
  }
};

exports.getConsultationById = async (req, res) => {
  try {
    const consultation = await Consultation.findByPk(req.params.id);
    if (!consultation) return res.status(404).json({ error: 'Not found' });
    res.json(consultation);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching consultation' });
  }
};

exports.updateConsultation = async (req, res) => {
  try {
    const { status, notes } = req.body;

    const [updated] = await Consultation.update(
      { status, notes },
      { where: { id: req.params.id } }
    );
    if (!updated) return res.status(404).json({ error: 'Consultation not found' });
    res.json({ message: 'Updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Update failed', details: err.message });
  }
};

exports.deleteConsultation = async (req, res) => {
  try {
    const deleted = await Consultation.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Delete failed', details: err.message });
  }
};
