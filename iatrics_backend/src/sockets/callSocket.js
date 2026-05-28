const {
  Consultation,
  Provider,
  UserWallet,
  ProviderWallet,
  PlatformWallet,
  LedgerEntry,
} = require("../models");

const PLATFORM_COMMISSION = 0.2;
const PROVIDER_SHARE = 0.8;

let consultationColumns;

async function getConsultationColumns() {
  if (consultationColumns) return consultationColumns;

  const queryInterface = Consultation.sequelize.getQueryInterface();
  consultationColumns = await queryInterface.describeTable(
    Consultation.getTableName()
  );

  return consultationColumns;
}

async function createCallConsultation({ userId, providerId, channelName }) {
  const columns = await getConsultationColumns();
  const now = new Date();
  const row = {};

  if (columns.userId) row.userId = userId;
  if (columns.providerId) row.providerId = providerId;
  if (columns.channelName) row.channelName = channelName;
  if (columns.type) row.type = "instant";
  if (columns.duration) row.duration = 0;
  if (columns.price) row.price = 0;
  if (columns.fee) row.fee = 0;
  if (columns.cost) row.cost = 0;
  if (columns.createdAt) row.createdAt = now;
  if (columns.updatedAt) row.updatedAt = now;

  if (!Object.keys(row).length) return;

  await Consultation.sequelize
    .getQueryInterface()
    .bulkInsert(Consultation.getTableName(), [row]);
}

async function markCallEnded(channelName) {
  const columns = await getConsultationColumns();

  if (!columns.channelName) return;

  const values = {};

  if (columns.endedAt) values.endedAt = new Date();
  if (columns.updatedAt) values.updatedAt = new Date();

  if (!Object.keys(values).length) return;

  await Consultation.sequelize
    .getQueryInterface()
    .bulkUpdate(Consultation.getTableName(), values, { channelName });
}

module.exports = (io) => {
  const users = new Map();
  const providers = new Map();

  io.on("connection", (socket) => {
    console.log("🟢 Socket connected:", socket.id);

    // =========================
    // REGISTER USER
    // =========================
    socket.on("register-user", (userId) => {
      users.set(userId.toString(), socket.id);
      socket.join(`user-${userId}`);
      console.log("👤 User registered for calls:", userId);
    });

    // =========================
    // REGISTER PROVIDER
    // =========================
    socket.on("register-provider", async (providerId) => {
      providers.set(providerId.toString(), socket.id);
      socket.data.providerId = providerId.toString();
      await Provider.update(
        { isOnline: true },
        { where: { id: providerId } }
      ).catch((err) => {
        console.error("❌ Failed to mark provider online:", err.message);
      });
      console.log("🩺 Provider registered for calls:", providerId);
    });

    socket.on("register", async ({ userId, role }) => {
      if (role?.toUpperCase() === "PROVIDER") {
        providers.set(userId.toString(), socket.id);
        socket.data.providerId = userId.toString();
        await Provider.update(
          { isOnline: true },
          { where: { id: userId } }
        ).catch((err) => {
          console.error("❌ Failed to mark provider online:", err.message);
        });
        console.log("🩺 Provider registered for calls:", userId);
      } else {
        users.set(userId.toString(), socket.id);
        socket.join(`user-${userId}`);
        console.log("👤 User registered for calls:", userId);
      }
    });

    // =========================
    // PLACE CALL
    // =========================
    socket.on("place-call", async (data) => {
      const { userId, providerId, channelName } = data;

      try {
        await createCallConsultation({
          userId,
          providerId,
          channelName,
        });
      } catch (err) {
        console.error("❌ Failed to create call consultation:", err.message);
      }

      const providerSocket = providers.get(providerId.toString());

      if (providerSocket) {
        io.to(providerSocket).emit("incoming-call", {
          ...data,
          callerId: data.callerId ?? userId,
        });
      } else {
        socket.emit("call-declined", {
          channelName,
          providerId,
          reason: "provider_offline",
        });
      }
    });

    // =========================
    // ACCEPT CALL
    // =========================
    socket.on("accept-call", (data) => {
      const userSocket = users.get(data.userId.toString());
      if (userSocket) {
        io.to(userSocket).emit("call-accepted", data);
      }
    });

    // =========================
    // DECLINE CALL
    // =========================
    socket.on("decline-call", (data) => {
      const userSocket = users.get(data.userId.toString());
      if (userSocket) {
        io.to(userSocket).emit("call-declined", data);
      }
    });

    // =========================
    // 💰 BILLING TICK
    // =========================
    socket.on("billing-tick", async ({ channelName }) => {
      try {
        const session = await Consultation.findOne({
          where: { channelName },
        });

        if (!session || session.status !== "active") return;

        const amount = 50;

        const userWallet = await UserWallet.findOne({
          where: { userId: session.userId },
        });

        if (!userWallet || userWallet.balance < amount) {
          io.to(`user-${session.userId}`).emit("call-ended", {
            reason: "insufficient_balance",
          });

          const providerSocket = providers.get(
            session.providerId.toString()
          );

          if (providerSocket) {
            io.to(providerSocket).emit("call-ended", {
              reason: "user_no_funds",
            });
          }

          await session.update({
            status: "ended",
            endedAt: new Date(),
          });

          return;
        }

        const platformCut = amount * PLATFORM_COMMISSION;
        const providerCut = amount * PROVIDER_SHARE;

        // USER DEDUCTION
        userWallet.balance -= amount;
        await userWallet.save();

        io.to(`user-${session.userId}`).emit("wallet-update", {
          balance: userWallet.balance,
        });

        // PROVIDER CREDIT
        const providerWallet = await ProviderWallet.findOne({
          where: { providerId: session.providerId },
        });

        if (providerWallet) {
          providerWallet.balance += providerCut;
          await providerWallet.save();

          const providerSocket = providers.get(
            session.providerId.toString()
          );

          if (providerSocket) {
            io.to(providerSocket).emit("wallet-update", {
              balance: providerWallet.balance,
            });
          }
        }

        // PLATFORM
        await PlatformWallet.increment(
          { balance: platformCut },
          { where: { id: 1 } }
        );

        session.duration += 10;
        session.cost += amount;
        await session.save();

        await LedgerEntry.create({
          reference: `TXN_${Date.now()}`,
          type: "debit",
          amount,
          userId: session.userId,
          channelName,
          source: "consultation",
        });

        await LedgerEntry.create({
          reference: `TXN_${Date.now() + 1}`,
          type: "earning",
          amount: providerCut,
          providerId: session.providerId,
          channelName,
          source: "consultation",
        });

      } catch (err) {
        console.error("❌ Billing error:", err);
      }
    });

    // =========================
    // END CALL
    // =========================
    socket.on("end-call", async (data) => {
      try {
        await markCallEnded(data.channelName);
        io.emit("call-ended", data.channelName);
      } catch (err) {
        console.error("❌ Failed to end call:", err.message);
        io.emit("call-ended", data.channelName);
      }
    });

    // =========================
    // DISCONNECT
    // =========================
    socket.on("disconnect", async () => {
      console.log("🔴 Disconnected:", socket.id);

      for (const [key, value] of users.entries()) {
        if (value === socket.id) users.delete(key);
      }

      for (const [key, value] of providers.entries()) {
        if (value === socket.id) {
          providers.delete(key);
          await Provider.update(
            { isOnline: false },
            { where: { id: key } }
          ).catch((err) => {
            console.error("❌ Failed to mark provider offline:", err.message);
          });
        }
      }
    });
  });
};
