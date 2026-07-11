"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("email_logs", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      eventType: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      recipient: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      provider: Sequelize.STRING,
      providerMessageId: Sequelize.STRING,
      status: {
        type: Sequelize.STRING,
        defaultValue: "pending",
      },
      attemptCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      entityType: Sequelize.STRING,
      entityId: Sequelize.STRING,
      idempotencyKey: {
        type: Sequelize.STRING,
        unique: true,
      },
      lastErrorCode: Sequelize.STRING,
      sentAt: Sequelize.DATE,
      failedAt: Sequelize.DATE,
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.addIndex("email_logs", ["eventType"]);
    await queryInterface.addIndex("email_logs", ["entityType", "entityId"]);
    await queryInterface.addIndex("email_logs", ["status"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("email_logs");
  },
};
