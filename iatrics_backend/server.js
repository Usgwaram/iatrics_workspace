require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const xss = require("xss-clean");
const hpp = require("hpp");

const cron = require("node-cron");

const db = require("./src/models");
const withdrawalRoutes = require("./src/routes/withdrawalRoutes");
const webhookRoutes = require("./src/routes/webhook");
const { reconcile } = require("./src/services/reconciliationService");

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5002;

// ============================
// TRUST PROXY (RENDER SAFE)
// ============================
app.set("trust proxy", 1);

// ============================
// SECURITY MIDDLEWARE
// ============================
app.use(cors());
app.use(helmet());

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
);

app.use(xss());
app.use(hpp());
app.use(express.json());

// ============================
// ROUTES
// ============================
app.use("/api/auth", require("./src/routes/authRoutes"));
app.use("/api/users", require("./src/routes/userRoutes"));
app.use("/api/providers", require("./src/routes/providerRoutes"));
app.use("/api/consultations", require("./src/routes/Consultation"));
app.use("/api/withdrawals", withdrawalRoutes);
app.use("/api/webhook", webhookRoutes);
app.use("/api/paystack", require("./src/routes/paystack"));
app.use("/api/admin/finance", require("./src/routes/adminFinancialRoutes"));
app.use("/api/wallet", require("./src/routes/wallet"));
app.use("/api/agora", require("./src/routes/agora"));

app.use(require("./src/middleware/apiResponseWrapper"));

// ============================
// HEALTH CHECK (IMPORTANT FOR RENDER)
// ============================
app.get("/", (req, res) => {
  res.status(200).send("🚀 Iatrics API + Socket Running");
});

// ============================
// SOCKET SETUP
// ============================
const io = new Server(server, {
  cors: { origin: "*" },
});

app.set("io", io);
require("./src/sockets/callSocket")(io);

// ============================
// CRON JOB (SAFE)
// ============================
cron.schedule("0 * * * *", async () => {
  try {
    console.log("⏰ Running hourly reconciliation...");
    await reconcile();
  } catch (err) {
    console.error("❌ Reconciliation error:", err);
  }
});

// ============================
// TEST USER SEED (SAFE + NON-BLOCKING)
// ============================
const seedTestUsers = async () => {
  try {
    const bcrypt = require("bcrypt");
    const { User } = require("./src/models");

    const users = [
      { email: "user@test.com", role: "user", name: "Test User" },
      { email: "provider@test.com", role: "provider", name: "Test Provider" },
    ];

    for (const u of users) {
      const exists = await User.findOne({ where: { email: u.email } });

      if (!exists) {
        await User.create({
          fullName: u.name,
          email: u.email,
          password: await bcrypt.hash("123456", 10),
          role: u.role,
        });
      }
    }

    console.log("✅ Test users ready");
  } catch (err) {
    console.error("❌ Seed error:", err);
  }
};

// ============================
// START SERVER (ROBUST)
// ============================
const startServer = async () => {
  try {
    console.log("🧠 Connecting to database...");

    await db.sequelize.authenticate();
    console.log("🧠 DB connected successfully");

    const [result] = await db.sequelize.query("SELECT current_user;");
    console.log("🧠 Connected as DB user:", result);

    console.log(
      "🔑 PAYSTACK KEY:",
      process.env.PAYSTACK_SECRET_KEY?.slice(0, 10)
    );

    // ============================
    // DB SYNC (SAFE MODE ONLY)
    // ============================
    if (process.env.NODE_ENV === "development") {
      if (process.env.DB_RESET === "true") {
        console.log("⚠️ Resetting DB...");
        await db.sequelize.sync({ force: true });
      } else {
        await db.sequelize.sync();
      }
    } else {
      console.log("🚀 Production mode: skipping auto-sync (safe)");
    }

    // Seed AFTER DB is ready
    await seedTestUsers();

  } catch (err) {
    console.error("❌ Startup error (non-fatal):", err);
  }

  // ============================
  // IMPORTANT: ALWAYS START SERVER
  // ============================
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

// ============================
// GLOBAL ERROR HANDLER
// ============================
app.use((err, req, res, next) => {
  console.error("🔥 ERROR:", err);

  res.status(500).json({
    error: "Internal Server Error",
  });
});

// START APP
startServer();