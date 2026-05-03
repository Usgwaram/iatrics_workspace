require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const withdrawalRoutes = require("./src/routes/withdrawalRoutes");
const db = require("./src/models");
const webhookRoutes = require("./src/routes/webhook");

const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const xss = require("xss-clean");
const hpp = require("hpp");

const cron = require("node-cron");
const { reconcile } = require("./src/services/reconciliationService");

cron.schedule("0 * * * *", async () => {
  console.log("⏰ Running hourly reconciliation...");
  await reconcile();
});

const app = express();

app.set("trust proxy", 1); // ✅ FIX FOR NGROK + RATE LIMIT
const PORT = process.env.PORT || 5002;

// ============================
// MIDDLEWARE
// ============================


app.use(cors());

// 🔒 SECURITY LAYER
app.use(helmet());

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
);

app.use(xss());
app.use(hpp());

// Body parser
app.use(express.json());

// ============================
// ROUTES (NO DUPLICATES)
// ============================
app.use("/api/auth", require("./src/routes/authRoutes"));

app.use("/api/users", require("./src/routes/userRoutes"));
app.use("/api/providers", require("./src/routes/providerRoutes"));
// ❌ REMOVE adminRoutes completely
app.use(require("./src/middleware/apiResponseWrapper"));
app.use("/api/consultations", require("./src/routes/consultation"));
app.use("/api/withdrawals", require("./src/routes/withdrawalRoutes"));
app.use("/api/webhook", require("./src/routes/webhook"));
app.use("/api/paystack", require("./src/routes/paystack"));

app.use("/api/admin/finance", require("./src/routes/adminFinancialRoutes"));

app.use("/api/wallet", require("./src/routes/wallet"));
app.use("/api/agora", require("./src/routes/agora"));
// ============================
// HEALTH CHECK
// ============================
app.get("/", (req, res) => {
  res.send("🚀 Iatrics API + Socket Running");
});

// ============================
// SOCKET SERVER (CORRECT WAY)
// ============================
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

app.set("io", io);

require("./src/sockets/callSocket")(io);

// ============================
// START SERVER
// ============================
const startServer = async () => {
  try {
    console.log("🧠 Connecting to database...");
    await db.sequelize.authenticate();
    console.log("🧠 DB connected successfully");


    const [result] = await db.sequelize.query("SELECT current_user;");
    console.log("🧠 Connected as DB user:", result);


console.log("🔑 PAYSTACK KEY:", process.env.PAYSTACK_SECRET_KEY?.slice(0, 10));
    // SAFE SYNC
    if (process.env.NODE_ENV === "development") {
      if (process.env.DB_RESET === "true") {
        console.log("⚠️ Resetting DB...");
        await db.sequelize.sync({ force: true });
      } else {
        await db.sequelize.sync();
      }
    } else {
      console.log("🚀 Production mode: safe sync");
      await db.sequelize.sync();
    }

    // IMPORTANT: use server.listen (NOT app.listen)
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error("❌ DB error:", err);
  }
};

app.use((err, req, res, next) => {
  console.error("🔥 ERROR:", err);

  res.status(500).json({
    error: "Internal Server Error",
  });
});

startServer();

const seedTestUsers = async () => {
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
};

seedTestUsers();