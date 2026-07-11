const { Op } = require("sequelize");
const { Consultation, Provider, User } = require("../../models");
const { EMAIL_TYPES } = require("../../services/email/email.types");
const { appUrl, firstName } = require("../../services/email/email.workflow");
const { sendSafely } = require("../../services/email/email.service");

const REMINDER_WINDOWS = [
  { label: "24h", minutes: 24 * 60, toleranceMinutes: 30 },
  { label: "1h", minutes: 60, toleranceMinutes: 15 },
];

function consultationStartUtc(consultation) {
  if (!consultation.appointmentDate || !consultation.appointmentTime) return null;

  const time = String(consultation.appointmentTime).padStart(5, "0");
  const date = new Date(`${consultation.appointmentDate}T${time}:00+01:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function minutesUntil(date, now = new Date()) {
  return Math.round((date.getTime() - now.getTime()) / 60000);
}

async function sendConsultationReminders({ now = new Date(), logger = console } = {}) {
  const consultations = await Consultation.findAll({
    where: {
      status: {
        [Op.notIn]: ["cancelled", "canceled", "completed", "COMPLETED", "CANCELLED"],
      },
      appointmentDate: {
        [Op.ne]: null,
      },
    },
    include: [
      { model: User, required: false },
      { model: Provider, required: false, include: [{ model: User, required: false }] },
    ],
  });

  const results = [];

  for (const consultation of consultations) {
    const start = consultationStartUtc(consultation);
    if (!start) continue;

    const remaining = minutesUntil(start, now);
    const window = REMINDER_WINDOWS.find(
      (item) =>
        remaining <= item.minutes &&
        remaining >= item.minutes - item.toleranceMinutes
    );

    if (!window || !consultation.User?.email) continue;

    const providerUser = consultation.Provider?.User;

    const result = await sendSafely(
      {
        type: EMAIL_TYPES.CONSULTATION_REMINDER,
        to: consultation.User.email,
        data: {
          firstName: firstName(consultation.User.fullName),
          providerName: providerUser?.fullName || "your provider",
          consultationDate: consultation.appointmentDate,
          consultationTime: consultation.appointmentTime,
          timezone: "Africa/Lagos",
          minutesUntilConsultation: window.minutes,
          joinUrl: appUrl(`consultations/${consultation.id}`, "user"),
        },
        metadata: {
          entityType: "consultation",
          entityId: consultation.id,
          userId: consultation.User.id,
          consultationId: consultation.id,
          idempotencyKey: `consultation:${consultation.id}:reminder:${window.label}`,
        },
      },
      logger
    );

    results.push({
      consultationId: consultation.id,
      reminder: window.label,
      ...result,
    });
  }

  return results;
}

module.exports = {
  REMINDER_WINDOWS,
  sendConsultationReminders,
};
