require("dotenv").config();

const envFile =
  process.env.NODE_ENV === "production"
    ? ".env.production"
    : process.env.NODE_ENV === "staging"
    ? ".env.staging"
    : process.env.NODE_ENV === "test"
    ? ".env.test"
    : ".env";

require("dotenv").config({
  path: envFile,
  override: true,
});

console.log(`Loaded environment: ${envFile}`);

require("dotenv").config({ path: envFile, override: true });
const express = require("express");
const cors = require("cors");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
const db = require("./src/models");
const setupCallSocket = require("./src/sockets/callSocket");

// routes
const authRoutes = require("./src/routes/authRoutes");
const userRoutes = require("./src/routes/userRoutes");
const providerRoutes = require("./src/routes/providerRoutes");
const consultationRoutes = require("./src/routes/consultationRoutes") // FIXED CASE
const withdrawalRoutes = require("./src/routes/withdrawalRoutes");
const walletRoutes = require("./src/routes/wallet");
const paystackRoutes = require("./src/routes/paystack");
const webhookRoutes = require("./src/routes/webhook");
const agoraRoutes = require("./src/routes/agora");
const scheduleRoutes = require("./src/routes/scheduleRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const doctorRoutes = require("./src/routes/doctorRoutes");
const pricingRoutes = require("./src/routes/pricingRoutes");
const uploadRoutes = require("./src/routes/uploadRoutes");
const feedbackRoutes = require("./src/routes/feedbackRoutes");
const emailJobRoutes = require("./src/routes/emailJobRoutes");
const { assertProductionSecrets } = require("./src/config/secrets");
// security (safe fallback if missing in prod)
let helmet, rateLimit, xss, hpp, cron;

try {
  helmet = require("helmet");
  rateLimit = require("express-rate-limit");
  xss = require("xss-clean");
  hpp = require("hpp");
  cron = require("node-cron");
} catch (e) {
  console.log("⚠️ Security packages missing in production mode");
}

const app = express();
const server = http.createServer(app);
assertProductionSecrets();

const allowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins.length ? allowedOrigins : true,
  },
});

app.set("io", io);
setupCallSocket(io);

// ======================
// BASIC MIDDLEWARE
// ======================
app.use(
  cors({
    origin: allowedOrigins.length ? allowedOrigins : true,
  })
);
app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  })
);

if (helmet) app.use(helmet());
if (xss) app.use(xss());
if (hpp) app.use(hpp());

const rateLimitDisabled =
  process.env.DISABLE_RATE_LIMIT === "true" ||
  process.env.RATE_LIMIT_DISABLED === "true";

if (rateLimit && !rateLimitDisabled) {
  app.use(
    rateLimit({
      windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
      max: Number(process.env.RATE_LIMIT_MAX || 100),
    })
  );
}

// ======================
// ROUTES
// ======================
app.use("/admin", express.static(path.join(__dirname, "admin")));
app.use("/api/auth", require("./src/routes/authRoutes"));
app.use("/api/users", userRoutes);
app.use("/api/providers", providerRoutes);
app.use("/api/consultations", consultationRoutes);
app.use("/api/withdrawals", withdrawalRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/paystack", paystackRoutes);
app.use("/api/webhook", webhookRoutes);
app.use("/api/agora", agoraRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/payments", webhookRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/pricing", pricingRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/jobs/email", emailJobRoutes);
// health check
app.get("/", (req, res) => {
  res.send("🚀 Iatrics API + Socket Running");
});

// ======================
// DB START
// ======================
// ======================
// DB START
// ======================

const PORT = process.env.PORT || 5002;
const HOST = process.env.HOST || "0.0.0.0";

// Trust proxy (Render / Cloudflare / Load Balancer)
app.set("trust proxy", 1);

// Health endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    environment: process.env.NODE_ENV,
    host: process.env.APP_BASE_URL,
    timestamp: new Date().toISOString()
  });
});

const startServer = async () => {
  try {
    console.log("🧠 Environment:", process.env.NODE_ENV);
    console.log("🧠 Loading:", process.env.APP_BASE_URL);

    console.log("🧠 Connecting DB...");

    await db.sequelize.authenticate();

    console.log("✅ DB connected");

    console.log("🧠 Syncing models...");

    await db.sequelize.sync({
      alter: false
    });

    console.log("✅ DB synced");

    server.listen(PORT, HOST, () => {
      console.log("");
      console.log("🚀 Iatrics Backend Started");
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
      console.log(`📍 Host: ${HOST}`);
      console.log(`🔌 Port: ${PORT}`);
      console.log(`🌐 Base URL: ${process.env.APP_BASE_URL}`);
      console.log(`❤️ Health: ${process.env.APP_BASE_URL}/health`);
      console.log("");
    });

  } catch (error) {
    console.error("❌ Startup error");

    console.error(error);

    process.exit(1);
  }
};

// ======================
// TEST SAFE EXPORT
// ======================

if (process.env.NODE_ENV !== "test") {
  startServer();
}

module.exports = app;
