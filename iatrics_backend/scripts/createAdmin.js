require("dotenv").config();
const bcrypt = require("bcrypt");
const { sequelize, User } = require("../src/models");

async function createAdmin() {
  try {
    await sequelize.authenticate();
    console.log("Database connected.");

    const email = process.env.ADMIN_EMAIL || "admin@iatrics.ng";
    const password = process.env.ADMIN_PASSWORD || "Admin123!";
    const fullName = process.env.ADMIN_NAME || "Super Admin";

    const existing = await User.findOne({ where: { email } });

    if (existing) {
      await existing.update({
        fullName: existing.fullName || fullName,
        role: "admin",
      });
      console.log("Admin already exists. Ensured role is admin.");
      process.exit();
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      fullName,
      email,
      password: hashedPassword,
      role: "admin",
      isVerified: true,
    });

    console.log("Admin created successfully!");
    console.log("Email:", email);
    console.log("Password:", password);
    process.exit();
  } catch (error) {
    console.error("Error creating admin:", error);
    process.exit(1);
  }
}

createAdmin();
