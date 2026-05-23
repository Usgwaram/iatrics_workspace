"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("providers");

    if (!table.bankCode) {
      await queryInterface.addColumn("providers", "bankCode", {
        type: Sequelize.STRING,
      });
    }

    if (!table.accountNumber) {
      await queryInterface.addColumn("providers", "accountNumber", {
        type: Sequelize.STRING,
      });
    }

    if (!table.accountName) {
      await queryInterface.addColumn("providers", "accountName", {
        type: Sequelize.STRING,
      });
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable("providers");

    if (table.accountName) {
      await queryInterface.removeColumn("providers", "accountName");
    }

    if (table.accountNumber) {
      await queryInterface.removeColumn("providers", "accountNumber");
    }

    if (table.bankCode) {
      await queryInterface.removeColumn("providers", "bankCode");
    }
  },
};
