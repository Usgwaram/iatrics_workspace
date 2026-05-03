const db = require("../models");
const { Consultation, Provider } = db;

exports.createConsultation = async (req, res) => {
  try {
    const { providerId, channelName } = req.body;
    const userId = req.user.id;

    const provider = await Provider.findByPk(providerId);

    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    const consultation = await Consultation.create({
      userId,
      providerId,
      channelName,
      status: "PENDING"
    });

    return res.status(201).json({
      message: "Consultation created",
      consultation
    });

  } catch (error) {
    console.error("CONSULTATION ERROR:", error);
    return res.status(500).json({ message: "Failed to create consultation" });
  }
};

exports.getConsultations = async (req, res) => {
  return res.json([]);
};

exports.getConsultationById = async (req, res) => {
  return res.json({ id: req.params.id });
};

exports.acceptConsultation = async (req, res) => {
  try {
    const consultation = await Consultation.findByPk(req.params.id);

    if (!consultation) {
      return res.status(404).json({ message: "Not found" });
    }

    consultation.status = "IN_CALL";
    await consultation.save();

    res.json({ message: "Accepted", consultation });

  } catch (err) {
    res.status(500).json({ message: "Error" });
  }
};

exports.endConsultation = async (req, res) => {
  try {
    const consultation = await Consultation.findByPk(req.params.id);

    if (!consultation) {
      return res.status(404).json({ message: "Not found" });
    }

    consultation.status = "ENDED";
    await consultation.save();

    res.json({ message: "Ended", consultation });

  } catch (err) {
    res.status(500).json({ message: "Error" });
  }
};