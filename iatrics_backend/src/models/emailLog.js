module.exports = (sequelize, DataTypes) => {
  const EmailLog = sequelize.define(
    "EmailLog",
    {
      eventType: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      recipient: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      provider: DataTypes.STRING,
      providerMessageId: DataTypes.STRING,
      status: {
        type: DataTypes.STRING,
        defaultValue: "pending",
      },
      attemptCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      entityType: DataTypes.STRING,
      entityId: DataTypes.STRING,
      idempotencyKey: {
        type: DataTypes.STRING,
        unique: true,
      },
      lastErrorCode: DataTypes.STRING,
      sentAt: DataTypes.DATE,
      failedAt: DataTypes.DATE,
    },
    {
      tableName: "email_logs",
      timestamps: true,
    }
  );

  return EmailLog;
};
