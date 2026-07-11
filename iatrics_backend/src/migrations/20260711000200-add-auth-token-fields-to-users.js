"use strict";

async function addColumnIfMissing(queryInterface, Sequelize, table, column, definition) {
  const description = await queryInterface.describeTable(table);
  if (!description[column]) {
    await queryInterface.addColumn(table, column, definition(Sequelize));
  }
}

async function removeColumnIfPresent(queryInterface, table, column) {
  const description = await queryInterface.describeTable(table);
  if (description[column]) {
    await queryInterface.removeColumn(table, column);
  }
}

async function addIndexIfMissing(queryInterface, table, fields, name) {
  const indexes = await queryInterface.showIndex(table);
  if (!indexes.some((index) => index.name === name)) {
    await queryInterface.addIndex(table, fields, { name });
  }
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await addColumnIfMissing(queryInterface, Sequelize, "users", "emailVerifiedAt", (S) => ({
      type: S.DATE,
      allowNull: true,
    }));

    await addColumnIfMissing(queryInterface, Sequelize, "users", "emailVerificationTokenHash", (S) => ({
      type: S.STRING,
      allowNull: true,
    }));

    await addColumnIfMissing(queryInterface, Sequelize, "users", "emailVerificationExpiresAt", (S) => ({
      type: S.DATE,
      allowNull: true,
    }));

    await addColumnIfMissing(queryInterface, Sequelize, "users", "emailVerificationSentAt", (S) => ({
      type: S.DATE,
      allowNull: true,
    }));

    await addColumnIfMissing(queryInterface, Sequelize, "users", "passwordResetTokenHash", (S) => ({
      type: S.STRING,
      allowNull: true,
    }));

    await addColumnIfMissing(queryInterface, Sequelize, "users", "passwordResetExpiresAt", (S) => ({
      type: S.DATE,
      allowNull: true,
    }));

    await addColumnIfMissing(queryInterface, Sequelize, "users", "passwordResetRequestedAt", (S) => ({
      type: S.DATE,
      allowNull: true,
    }));

    await addIndexIfMissing(
      queryInterface,
      "users",
      ["emailVerificationTokenHash"],
      "users_email_verification_token_hash"
    );
    await addIndexIfMissing(
      queryInterface,
      "users",
      ["passwordResetTokenHash"],
      "users_password_reset_token_hash"
    );
  },

  async down(queryInterface) {
    await removeColumnIfPresent(queryInterface, "users", "passwordResetRequestedAt");
    await removeColumnIfPresent(queryInterface, "users", "passwordResetExpiresAt");
    await removeColumnIfPresent(queryInterface, "users", "passwordResetTokenHash");
    await removeColumnIfPresent(queryInterface, "users", "emailVerificationSentAt");
    await removeColumnIfPresent(queryInterface, "users", "emailVerificationExpiresAt");
    await removeColumnIfPresent(queryInterface, "users", "emailVerificationTokenHash");
    await removeColumnIfPresent(queryInterface, "users", "emailVerifiedAt");
  },
};
