// scripts/resetPassword.js
const bcrypt = require("bcrypt");
const { User } = require("../src/models");

const email = "user@iatrics.ng";
const newPassword = "123456";

async function reset() {
  try {
    const hashed = await bcrypt.hash(newPassword, 10);
    await User.update(
      { password: hashed },
      { where: { email } }
    );
    console.log("✅ Password reset successfully");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error resetting password:", err);
    process.exit(1);
  }
}

reset();