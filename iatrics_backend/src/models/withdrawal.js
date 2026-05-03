module.exports = (sequelize, DataTypes) => {
  const Withdrawal = sequelize.define("Withdrawal", {
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "pending",
    },
    bankCode: DataTypes.STRING,
    accountNumber: DataTypes.STRING,
  }, {
    tableName: "withdrawals",
    timestamps: true
  });

  Withdrawal.associate = (models) => {
    Withdrawal.belongsTo(models.User, {
      foreignKey: "userId",
    });
  };

  return Withdrawal;
};