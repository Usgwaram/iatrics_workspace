const db = require("../models");
const { Provider } = db;

exports.createProvider = async (req, res) => {
  try {
    const userId = req.user.id;

    const provider = await Provider.create({
      userId,
      specialty: req.body.specialty,
      licenseNumber: req.body.licenseNumber,
      yearsOfExperience: req.body.yearsOfExperience,
      languages: Array.isArray(req.body.languages)
        ? req.body.languages
        : ["English"],
    });

    return res.status(201).json({
      message: "Provider created",
      provider
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error creating provider" });
  }
};

exports.getProvider = async (req, res) => {
  try {
    const provider = await Provider.findOne({
      where: { userId: req.user.id }
    });

    return res.json(provider);

  } catch (error) {
    return res.status(500).json({ message: "Error fetching provider" });
  }
};
