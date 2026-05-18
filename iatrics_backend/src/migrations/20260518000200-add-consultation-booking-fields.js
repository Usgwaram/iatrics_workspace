"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("Consultations");

    if (!table.symptoms) {
      await queryInterface.addColumn("Consultations", "symptoms", {
        type: Sequelize.TEXT,
      });
    }

    if (!table.appointmentDate) {
      await queryInterface.addColumn("Consultations", "appointmentDate", {
        type: Sequelize.DATEONLY,
      });
    }

    if (!table.appointmentTime) {
      await queryInterface.addColumn("Consultations", "appointmentTime", {
        type: Sequelize.STRING,
      });
    }

    if (!table.price) {
      await queryInterface.addColumn("Consultations", "price", {
        type: Sequelize.FLOAT,
      });
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable("Consultations");

    if (table.price) await queryInterface.removeColumn("Consultations", "price");
    if (table.appointmentTime) {
      await queryInterface.removeColumn("Consultations", "appointmentTime");
    }
    if (table.appointmentDate) {
      await queryInterface.removeColumn("Consultations", "appointmentDate");
    }
    if (table.symptoms) {
      await queryInterface.removeColumn("Consultations", "symptoms");
    }
  },
};
