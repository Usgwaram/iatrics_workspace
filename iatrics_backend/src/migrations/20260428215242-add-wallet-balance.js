"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("users");

    if (!table.walletBalance) {
      await queryInterface.addColumn("users", "walletBalance", {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0,
      });
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable("users");

    if (table.walletBalance) {
      await queryInterface.removeColumn("users", "walletBalance");
    }
  },
};
