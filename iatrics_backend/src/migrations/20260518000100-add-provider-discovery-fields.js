"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("providers");

    if (!table.languages) {
      await queryInterface.addColumn("providers", "languages", {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: ["English"],
      });
    }

    if (!table.isOnline) {
      await queryInterface.addColumn("providers", "isOnline", {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      });
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable("providers");

    if (table.isOnline) {
      await queryInterface.removeColumn("providers", "isOnline");
    }

    if (table.languages) {
      await queryInterface.removeColumn("providers", "languages");
    }
  },
};
