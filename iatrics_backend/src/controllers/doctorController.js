const { Provider, User } = require("../models");

exports.listDoctors = async (req, res) => {
  try {
    const { specialty, language, online } = req.query;

    const where = {};

    if (specialty) where.specialty = specialty;
    if (online === "true") where.isOnline = true;

    let doctors = await Provider.findAll({
      where,
      include: [
        {
          model: User,
          attributes: ["id", "fullName", "email"],
        },
      ],
      order: [["yearsOfExperience", "DESC"]],
    });

    if (language) {
      doctors = doctors.filter((doctor) =>
        Array.isArray(doctor.languages) && doctor.languages.includes(language)
      );
    }

    return res.json({
      success: true,
      data: doctors,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getDoctorProfile = async (req, res) => {
  try {
    const doctor = await Provider.findByPk(req.params.id, {
      include: [
        {
          model: User,
          attributes: ["id", "fullName", "email"],
        },
      ],
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    return res.json({
      success: true,
      data: doctor,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
