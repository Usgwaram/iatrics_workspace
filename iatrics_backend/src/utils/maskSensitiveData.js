const SENSITIVE_KEYS = [
  "password",
  "token",
  "secret",
  "authorization",
  "jwt",
  "otp",
  "reset",
  "verification",
  "authorization_code",
  "card",
  "accountNumber",
  "account_number",
  "prescription",
  "diagnosis",
  "clinicalNotes",
  "notes",
  "symptoms",
  "message",
];

function maskEmail(email) {
  if (!email || typeof email !== "string" || !email.includes("@")) return email;

  const [name, domain] = email.split("@");
  const visible = name.slice(0, 2);
  return `${visible}${"*".repeat(Math.max(name.length - 2, 1))}@${domain}`;
}

function maskAccountNumber(value) {
  if (!value) return value;
  const digits = String(value).replace(/\D/g, "");
  if (digits.length <= 4) return "****";
  return `${"*".repeat(Math.max(digits.length - 4, 4))}${digits.slice(-4)}`;
}

function shouldMaskKey(key) {
  return SENSITIVE_KEYS.some((sensitive) =>
    key.toLowerCase().includes(sensitive.toLowerCase())
  );
}

function maskSensitiveData(value) {
  if (Array.isArray(value)) return value.map(maskSensitiveData);

  if (value && typeof value === "object") {
    return Object.keys(value).reduce((acc, key) => {
      if (shouldMaskKey(key)) {
        acc[key] = "[REDACTED]";
      } else if (key.toLowerCase().includes("email")) {
        acc[key] = maskEmail(value[key]);
      } else {
        acc[key] = maskSensitiveData(value[key]);
      }
      return acc;
    }, {});
  }

  return value;
}

module.exports = {
  maskAccountNumber,
  maskEmail,
  maskSensitiveData,
};
