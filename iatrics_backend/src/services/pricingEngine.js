function calculateConsultationPrice({
  specialty,
  yearsOfExperience = 0,
  type = "instant",
  hour = new Date().getHours(),
}) {
  let base = 3000;

  if (specialty === "Cardiology") base = 8000;
  if (specialty === "Dermatology") base = 6000;
  if (specialty === "Pediatrics") base = 5000;
  if (specialty === "General Medicine") base = 3000;

  if (yearsOfExperience >= 10) base += 3000;
  else if (yearsOfExperience >= 5) base += 1500;

  if (type === "instant") base += 1000;

  if (hour >= 22 || hour < 6) {
    base = Math.round(base * 1.3);
  }

  return base;
}

module.exports = { calculateConsultationPrice };
