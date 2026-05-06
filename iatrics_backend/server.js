require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const db = require("./src/models");

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

const io = new Server(server, {
  cors: { origin: "*" },
});

app.set("io", io);

// ======================
// BASIC MIDDLEWARE
// ======================
app.use(cors());
app.use(express.json());

if (helmet) app.use(helmet());
if (xss) app.use(xss());
if (hpp) app.use(hpp());

if (rateLimit) {
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
    })
  );
}

// ======================
// ROUTES
// ======================
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/providers", providerRoutes);
app.use("/api/consultations", consultationRoutes);
app.use("/api/withdrawals", withdrawalRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/paystack", paystackRoutes);
app.use("/api/webhook", webhookRoutes);
app.use("/api/agora", agoraRoutes);

// health check
app.get("/", (req, res) => {
  res.send("🚀 Iatrics API + Socket Running");
});

// ======================
// DB START
// ======================
const startServer = async () => {
  try {
    console.log("🧠 Connecting DB...");
    await db.sequelize.authenticate();
    console.log("🧠 DB connected");

    await db.sequelize.sync();

    const PORT = process.env.PORT || 5002;

    server.listen(PORT, () => {
      console.log(`🚀 Server running on ${PORT}`);
    });

  } catch (err) {
    console.error("❌ Startup error:", err);
  }
};

startServer();