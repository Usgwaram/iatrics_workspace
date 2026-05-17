const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const db = require("../models");
const { User } = db;

const ApiContract = require("../contracts/apiContract");
const { jwtSecret } = require("../config/secrets");

// ============================
// REGISTER
// ============================
exports.register = async (req, res) => {
  try {
    const { fullName, email, password, phone } = req.body;

    if (!email || !password || !fullName) {
      return res
        .status(400)
        .json(ApiContract.fail("Missing fields", "VALIDATION_ERROR"));
    }

    const existing = await User.findOne({ where: { email } });

    if (existing) {
      return res
        .status(400) // aligned with your tests
        .json(ApiContract.fail("User already exists", "USER_EXISTS"));
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email,
      phone,
      password: hashed,
    });

    return res.status(201).json(
      ApiContract.success(
        {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
        },
        "User registered"
      )
    );
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return res
      .status(500)
      .json(ApiContract.fail("Server error", "SERVER_ERROR"));
  }
};
// ============================
// LOGIN
// ============================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json(ApiContract.fail("Email and password required", "VALIDATION_ERROR"));
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res
        .status(404)
        .json(ApiContract.fail("User not found", "AUTH_NOT_FOUND"));
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res
        .status(401)
        .json(ApiContract.fail("Invalid credentials", "AUTH_INVALID"));
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      jwtSecret(),
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
   } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res
      .status(500)
      .json(ApiContract.fail("Server error", "SERVER_ERROR"));
  }
};

// ============================
// GET PROFILE
// ============================
exports.getProfile = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res
        .status(401)
        .json(ApiContract.fail("Unauthorized", "AUTH_UNAUTHORIZED"));
    }

    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res
        .status(404)
        .json(ApiContract.fail("User not found", "NOT_FOUND"));
    }

    return res.json(ApiContract.success(user, "Profile fetched"));
  } catch (err) {
    console.error("PROFILE ERROR:", err);
    return res
      .status(500)
      .json(ApiContract.fail("Server error", "SERVER_ERROR"));
  }
};
