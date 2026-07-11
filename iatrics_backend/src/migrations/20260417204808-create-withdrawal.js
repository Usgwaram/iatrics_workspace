"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("withdrawals", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },

      amount: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },

      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "pending",
      },

      bankCode: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      accountNumber: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      userId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },

      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    await queryInterface.addIndex("withdrawals", ["userId"]);
    await queryInterface.addIndex("withdrawals", ["status"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("withdrawals");
  },
};
