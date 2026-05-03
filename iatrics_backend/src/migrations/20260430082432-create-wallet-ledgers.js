"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("wallet_ledgers", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },

      userId: {
        type: Sequelize.UUID,
        allowNull: false,
      },

      type: {
        type: Sequelize.ENUM("credit", "debit"),
        allowNull: false,
      },

      amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },

      balanceAfter: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },

      reference: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      source: {
        type: Sequelize.STRING, // paystack, withdrawal, admin
        allowNull: false,
      },

      metadata: {
        type: Sequelize.JSONB,
        allowNull: true,
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.addIndex("wallet_ledgers", ["userId"]);
    await queryInterface.addIndex("wallet_ledgers", ["reference"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("wallet_ledgers");
  },
};