module.exports = (sequelize, DataTypes) => {
  const Complaint = sequelize.define("Complaint", {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    consultationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    category: DataTypes.STRING,
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "open",
    },
  });

  Complaint.associate = (models) => {
    Complaint.belongsTo(models.User, { foreignKey: "userId" });
    Complaint.belongsTo(models.Consultation, { foreignKey: "consultationId" });
  };

  return Complaint;
};
