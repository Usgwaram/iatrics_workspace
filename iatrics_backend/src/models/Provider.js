
module.exports = (sequelize, DataTypes) => {
  const Provider = sequelize.define("Provider", {
    userId: DataTypes.INTEGER,

    specialty: DataTypes.STRING,
    licenseNumber: DataTypes.STRING,
    yearsOfExperience: DataTypes.INTEGER,

    onboardingStep: {
      type: DataTypes.STRING,
      defaultValue: "REGISTERED",
      validate: {
        isIn: [[
          "REGISTERED",
          "PROFILE_COMPLETED",
          "DOCUMENTS_SUBMITTED",
          "BANK_SETUP_DONE",
          "UNDER_REVIEW",
          "APPROVED"
        ]]
      }
    },

    isApproved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

  }, {
    tableName: "providers",
    timestamps: true
  });

  return Provider;
};