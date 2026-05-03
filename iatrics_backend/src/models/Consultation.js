module.exports = (sequelize, DataTypes) => {
  const Consultation = sequelize.define("Consultation", {

    channelName: DataTypes.STRING,

    status: {
      type: DataTypes.STRING,
      validate: {
        isIn: [["PENDING", "ONGOING", "ENDED"]]
      },
      defaultValue: "PENDING"
    },

    duration: DataTypes.INTEGER,

    fee: DataTypes.DECIMAL(10,2)

  }, {
    tableName: "consultations",
    timestamps: true
  });

  Consultation.associate = (models) => {
    Consultation.belongsTo(models.User, { as: "user" });
    Consultation.belongsTo(models.Provider, { as: "provider" });
  };

  return Consultation;
};