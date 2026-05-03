require("dotenv").config();
const bcrypt = require("bcrypt");
const { sequelize, User } = require("../models");

async function createAdmin() {
  try {
    await sequelize.authenticate();
    console.log("Database connected.");

    const email = "admin@iatrics.ng";   // change if you want
    const password = "Admin123!";       // change this immediately after login

    const existing = await User.findOne({ where: { email } });

    if (existing) {
      console.log("Admin already exists.");
      process.exit();
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name: "Super Admin",
      email,
      password: hashedPassword,
      role: "admin",
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
