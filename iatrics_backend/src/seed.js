const bcrypt = require("bcrypt");
const { sequelize, User, Provider } = require("./models");

const seed = async () => {
  try {
    await sequelize.sync({ force: true }); // ⚠️ drops all tables and recreates

    // --------------------
    // Admin
    // --------------------
    const adminPassword = await bcrypt.hash("Admin123!", 10);
    const admin = await User.create({
      fullName: "System Administrator",
      email: "admin@iatrics.ng",
      password: adminPassword,
      role: "admin",
      phone: "08000000000",
    });

    // --------------------
    // Provider
    // --------------------
    const providerPassword = await bcrypt.hash("Provider123!", 10);
    const providerUser = await User.create({
      fullName: "Dr. Provider",
      email: "provider@iatrics.ng",
      password: providerPassword,
      role: "provider",
      phone: "08011112222",
    });

    const providerProfile = await Provider.create({
      userId: providerUser.id,
      specialization: "Cardiology",
      phone: providerUser.phone,
      isActive: true,
    });

    // --------------------
    // Regular User
    // --------------------
    const userPassword = await bcrypt.hash("User123!", 10);
    const user = await User.create({
      fullName: "John Doe",
      email: "user@iatrics.ng",
      password: userPassword,
      role: "user",
      phone: "08022223333",
    });

    console.log("✅ Seed completed successfully!");
    console.log(`Admin: admin@iatrics.ng / Admin123!`);
    console.log(`Provider: provider@iatrics.ng / Provider123!`);
    console.log(`User: user@iatrics.ng / User123!`);

    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
};

seed();