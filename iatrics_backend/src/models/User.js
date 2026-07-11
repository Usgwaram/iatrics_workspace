module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("User", {

    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING,
      unique: true,
    },

    phone: DataTypes.STRING,

    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    role: {
      type: DataTypes.STRING,
      defaultValue: "USER",
    },

    onboardingStep: {
      type: DataTypes.STRING,
      defaultValue: "PROFILE_INCOMPLETE",
    },

    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    emailVerifiedAt: DataTypes.DATE,
    emailVerificationTokenHash: DataTypes.STRING,
    emailVerificationExpiresAt: DataTypes.DATE,
    emailVerificationSentAt: DataTypes.DATE,
    passwordResetTokenHash: DataTypes.STRING,
    passwordResetExpiresAt: DataTypes.DATE,
    passwordResetRequestedAt: DataTypes.DATE,

    // 💰 Wallet (protected field)
    walletBalance: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
      set() {
        throw new Error("Direct wallet update not allowed");
      }
    }

  }, {
    tableName: "users",
    timestamps: true
  });

  User.associate = (models) => {
    User.hasOne(models.Provider, { foreignKey: "userId" });
    User.hasMany(models.Consultation, { foreignKey: "userId" });
  };

  return User;
};
