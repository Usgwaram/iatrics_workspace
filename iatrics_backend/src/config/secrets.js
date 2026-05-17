function requiredEnv(name) {
  const value = process.env[name];

  if (!value && process.env.NODE_ENV === "production") {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function jwtSecret() {
  return requiredEnv("JWT_SECRET") || "test-secret";
}

function paystackSecret() {
  return requiredEnv("PAYSTACK_SECRET_KEY");
}

function agoraAppId() {
  return requiredEnv("AGORA_APP_ID");
}

function agoraCertificate() {
  return (
    requiredEnv("AGORA_APP_CERTIFICATE") ||
    requiredEnv("AGORA_APP_CERT")
  );
}

function assertProductionSecrets() {
  if (process.env.NODE_ENV !== "production") return;

  [
    "JWT_SECRET",
    "DATABASE_URL",
    "PAYSTACK_SECRET_KEY",
    "AGORA_APP_ID",
    "AGORA_APP_CERTIFICATE",
  ].forEach(requiredEnv);
}

module.exports = {
  requiredEnv,
  jwtSecret,
  paystackSecret,
  agoraAppId,
  agoraCertificate,
  assertProductionSecrets,
};
