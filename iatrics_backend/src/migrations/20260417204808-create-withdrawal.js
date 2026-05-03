module.exports = (sequelize, DataTypes) => {
  const Withdrawal = sequelize.define("Withdrawal", {
    amount: DataTypes.FLOAT,
    status: {
      type: DataTypes.STRING,
      defaultValue: "pending",
    },
    bankCode: DataTypes.STRING,
    accountNumber: DataTypes.STRING,
  });

  Withdrawal.associate = (models) => {
    Withdrawal.belongsTo(models.User, { foreignKey: "userId" });
  };

  return Withdrawal;
};