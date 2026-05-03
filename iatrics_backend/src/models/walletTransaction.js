module.exports = (sequelize, DataTypes) => {
  const WalletTransaction = sequelize.define("WalletTransaction", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    type: {
      type: DataTypes.ENUM("credit", "debit"),
      allowNull: false,
    },

    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM("pending", "confirmed", "failed"),
      defaultValue: "pending",
    },

    reference: {
      type: DataTypes.STRING,
      unique: true,
    },

    source: {
      type: DataTypes.STRING,
    }

  }, {
    tableName: "wallet_transactions",
    timestamps: true,
  });

  return WalletTransaction;
};