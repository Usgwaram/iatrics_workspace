module.exports = (sequelize, DataTypes) => {
  const WalletLedger = sequelize.define("WalletLedger", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: DataTypes.UUID,
    type: DataTypes.ENUM("credit", "debit"),
    amount: DataTypes.DECIMAL,
    balanceAfter: DataTypes.DECIMAL,
    reference: DataTypes.STRING,
    source: DataTypes.STRING,
    metadata: DataTypes.JSONB,
  });

  return WalletLedger;
};