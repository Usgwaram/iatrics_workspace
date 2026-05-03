module.exports = (sequelize, DataTypes) => {
  const Wallet = sequelize.define("Wallet", {
    balance: {
      type: DataTypes.DECIMAL(10,2),
      defaultValue: 0
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: "NGN"
    }
  });

  Wallet.associate = (models) => {
    Wallet.belongsTo(models.Provider, { foreignKey: "providerId" });
  };

  return Wallet;
};