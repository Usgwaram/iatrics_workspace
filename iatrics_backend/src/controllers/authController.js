const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const db = require("../models");
const { Provider, User, sequelize } = db;

const ApiContract = require("../contracts/apiContract");
const { jwtSecret } = require("../config/secrets");
const { authConfig } = require("../config/auth.config");
const {
  findUserForPasswordReset,
  issueEmailVerification,
  requestPasswordReset,
  sendIssuedPasswordResetEmail,
  sendIssuedVerificationEmail,
  validatePasswordStrength,
  verifyEmailToken,
} = require("../services/authTokenService");
const { sendWelcomeEmail } = require("../services/email/email.workflow");

const GENERIC_VERIFICATION_MESSAGE =
  "If the account exists and needs verification, a verification email will be sent.";
const GENERIC_RESET_MESSAGE =
  "If the account exists, password reset instructions will be sent.";

// ============================
// REGISTER
// ============================
exports.register = async (req, res) => {
  let tx;

  try {
    const {
      fullName,
      password,
      phone,
      role = "USER",
      specialty,
      licenseNumber,
      yearsOfExperience,
      languages,
    } = req.body;
    const email = String(req.body.email || "").trim().toLowerCase();

    if (!email || !password || !fullName) {
      return res
        .status(400)
        .json(ApiContract.fail("Missing fields", "VALIDATION_ERROR"));
    }

    if (!validatePasswordStrength(password)) {
      return res
        .status(400)
        .json(ApiContract.fail("Password is too weak", "WEAK_PASSWORD"));
    }

    const existing = await User.findOne({ where: { email } });

    if (existing) {
      return res
        .status(400) // aligned with your tests
        .json(ApiContract.fail("User already exists", "USER_EXISTS"));
    }

    tx = await sequelize.transaction();

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email,
      phone,
      role,
      password: hashed,
      isVerified: false,
    }, { transaction: tx });

    let provider = null;

    if (role === "PROVIDER") {
      provider = await Provider.create({
        userId: user.id,
        specialty,
        licenseNumber,
        yearsOfExperience,
        languages: Array.isArray(languages) ? languages : ["English"],
      }, { transaction: tx });
    }

    const issuedVerification = await issueEmailVerification(user, {
      transaction: tx,
      force: true,
    });

    await tx.commit();
    tx = null;

    await sendIssuedVerificationEmail(user, issuedVerification);

    return res.status(201).json(
      ApiContract.success(
        {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          emailVerifiedAt: user.emailVerifiedAt,
          provider,
        },
        "User registered"
      )
    );
  } catch (err) {
    if (tx) {
      await tx.rollback();
    }

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
    const email = String(req.body.email || "").trim().toLowerCase();
    const { password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json(ApiContract.fail("Email and password required", "VALIDATION_ERROR"));
    }

    const user = await User.findOne({
      where: { email },
      include: [
        {
          model: Provider,
          required: false,
        },
      ],
    });

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

    if (authConfig().requireEmailVerification && !user.emailVerifiedAt) {
      return res
        .status(403)
        .json(ApiContract.fail("Email verification required", "EMAIL_NOT_VERIFIED"));
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
        isVerified: Boolean(user.emailVerifiedAt || user.isVerified),
        emailVerifiedAt: user.emailVerifiedAt,
      },
      provider: user.Provider,
    });
   } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res
      .status(500)
      .json(ApiContract.fail("Server error", "SERVER_ERROR"));
  }
};

exports.verifyEmail = async (req, res) => {
  let tx;

  try {
    const token = req.body.token || req.query.token;

    if (!token) {
      return res
        .status(400)
        .json(ApiContract.fail("Invalid or expired verification token", "INVALID_TOKEN"));
    }

    tx = await sequelize.transaction();
    const result = await verifyEmailToken(token, { transaction: tx });

    if (!result.success) {
      await tx.rollback();
      tx = null;

      return res
        .status(400)
        .json(ApiContract.fail("Invalid or expired verification token", "INVALID_TOKEN"));
    }

    await tx.commit();
    tx = null;

    await sendWelcomeEmail(result.user);

    return res.json(
      ApiContract.success(
        {
          emailVerified: true,
          emailVerifiedAt: result.user.emailVerifiedAt,
        },
        "Email verified"
      )
    );
  } catch (err) {
    if (tx) {
      await tx.rollback();
    }

    console.error("VERIFY EMAIL ERROR:", err.message);
    return res
      .status(500)
      .json(ApiContract.fail("Server error", "SERVER_ERROR"));
  }
};

exports.resendVerification = async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();

    if (email) {
      const user = await User.findOne({ where: { email } });

      if (user && !user.emailVerifiedAt) {
        const issued = await issueEmailVerification(user);
        await sendIssuedVerificationEmail(user, issued);
      }
    }

    return res.json(ApiContract.success(null, GENERIC_VERIFICATION_MESSAGE));
  } catch (err) {
    console.error("RESEND VERIFICATION ERROR:", err.message);
    return res.json(ApiContract.success(null, GENERIC_VERIFICATION_MESSAGE));
  }
};

exports.requestPasswordReset = async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();

    if (email) {
      const user = await User.findOne({ where: { email } });
      const issued = await requestPasswordReset(user);
      await sendIssuedPasswordResetEmail(user, issued);
    }

    return res.json(ApiContract.success(null, GENERIC_RESET_MESSAGE));
  } catch (err) {
    console.error("PASSWORD RESET REQUEST ERROR:", err.message);
    return res.json(ApiContract.success(null, GENERIC_RESET_MESSAGE));
  }
};

exports.resetPassword = async (req, res) => {
  let tx;

  try {
    const { token, password } = req.body;

    if (!token || !validatePasswordStrength(password)) {
      return res
        .status(400)
        .json(ApiContract.fail("Invalid token or password", "VALIDATION_ERROR"));
    }

    tx = await sequelize.transaction();
    const user = await findUserForPasswordReset(token, { transaction: tx });

    if (!user) {
      await tx.rollback();
      tx = null;

      return res
        .status(400)
        .json(ApiContract.fail("Invalid or expired reset token", "INVALID_TOKEN"));
    }

    const hashed = await bcrypt.hash(password, 10);

    await user.update(
      {
        password: hashed,
        passwordResetTokenHash: null,
        passwordResetExpiresAt: null,
        passwordResetRequestedAt: null,
      },
      { transaction: tx }
    );

    await tx.commit();
    tx = null;

    return res.json(ApiContract.success(null, "Password reset successful"));
  } catch (err) {
    if (tx) {
      await tx.rollback();
    }

    console.error("PASSWORD RESET ERROR:", err.message);
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
