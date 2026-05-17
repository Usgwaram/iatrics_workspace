const { Provider, Consultation } = require("../models");

let consultationColumns;
let consultationForeignTables;

async function getConsultationColumns() {
  if (!consultationColumns) {
    const description =
      await Consultation.sequelize.getQueryInterface().describeTable("Consultations");
    consultationColumns = new Set(Object.keys(description));
  }

  return consultationColumns;
}

async function getConsultationForeignTables() {
  if (!consultationForeignTables) {
    const [rows] = await Consultation.sequelize.query(`
      SELECT
        a.attname AS column_name,
        confrelid::regclass::text AS foreign_table
      FROM pg_constraint c
      JOIN unnest(c.conkey) WITH ORDINALITY AS cols(attnum, ord) ON true
      JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = cols.attnum
      WHERE c.contype = 'f'
        AND c.conrelid = '"Consultations"'::regclass
    `);

    consultationForeignTables = rows.reduce((acc, row) => {
      acc[row.column_name] = row.foreign_table.replace(/"/g, "");
      return acc;
    }, {});
  }

  return consultationForeignTables;
}

// CREATE
exports.createConsultation = async (req, res) => {
  try {
    const { providerId, type, channelName } = req.body;

    const provider = await Provider.findByPk(providerId);

    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    const columns = await getConsultationColumns();
    const foreignTables = await getConsultationForeignTables();

    const payload = { status: "PENDING" };

    if (!foreignTables.userId || foreignTables.userId === "users") {
      payload.userId = req.user.id;
    }

    if (!foreignTables.providerId || foreignTables.providerId === "providers") {
      payload.providerId = providerId;
    }

    if (columns.has("type")) {
      payload.type = type || "video";
    }

    if (columns.has("channelName")) {
      payload.channelName =
        channelName || `consultation_${req.user.id}_${providerId}_${Date.now()}`;
    }

    const consultation = await Consultation.create(payload, {
      fields: Object.keys(payload),
      returning: Object.keys(payload),
    });

    return res.status(201).json({
      message: "Consultation created",
      consultation,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to create consultation",
      error: err.message,
    });
  }
};

// GET ALL
exports.getConsultations = async (req, res) => {
  try {
    const data = await Consultation.findAll({
      where: { userId: req.user.id },
    });

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// GET ONE
exports.getConsultationById = async (req, res) => {
  try {
    const data = await Consultation.findByPk(req.params.id);

    if (!data) {
      return res.status(404).json({ message: "Not found" });
    }

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
