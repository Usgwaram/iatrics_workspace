module.exports = (sequelize, DataTypes) => {
  const WithdrawalRequest = sequelize.define("WithdrawalRequest", {
    providerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "processing", "success", "failed"),
      defaultValue: "pending",
    },

    transferCode: DataTypes.STRING,
    bankName: DataTypes.STRING,
    accountNumber: DataTypes.STRING,
    accountName: DataTypes.STRING,
  });

  return WithdrawalRequest;
};