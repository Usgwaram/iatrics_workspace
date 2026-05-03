module.exports = (sequelize, DataTypes) => {
  const Transaction = sequelize.define("Transaction", {

    amount: DataTypes.DECIMAL(10,2),

    type: {
      type: DataTypes.STRING,
      defaultValue: "CREDIT"
    },

    reference: DataTypes.STRING,

    status: {
      type: DataTypes.STRING,
      defaultValue: "PENDING"
    }

  }, {
    tableName: "transactions",   // ✅ avoids case issues
    timestamps: true
  });

  Transaction.associate = (models) => {
    Transaction.belongsTo(models.Wallet);
  };

  return Transaction;
};