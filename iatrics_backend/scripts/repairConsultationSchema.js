require("dotenv").config();

const db = require("../src/models");

async function constraintExists(queryInterface, tableName, constraintName) {
  const constraints = await queryInterface.showConstraint(tableName);
  return constraints.some((constraint) => constraint.constraintName === constraintName);
}

async function dropConstraintIfExists(queryInterface, tableName, constraintName) {
  if (await constraintExists(queryInterface, tableName, constraintName)) {
    await queryInterface.removeConstraint(tableName, constraintName);
    console.log(`Dropped ${constraintName}`);
  }
}

async function addConstraintIfMissing(queryInterface, tableName, constraintName, options) {
  if (!(await constraintExists(queryInterface, tableName, constraintName))) {
    await queryInterface.addConstraint(tableName, {
      ...options,
      name: constraintName,
    });
    console.log(`Added ${constraintName}`);
  }
}

async function main() {
  const queryInterface = db.sequelize.getQueryInterface();

  await dropConstraintIfExists(
    queryInterface,
    "Consultations",
    "Consultations_userId_fkey"
  );
  await dropConstraintIfExists(
    queryInterface,
    "Consultations",
    "Consultations_providerId_fkey"
  );

  await addConstraintIfMissing(
    queryInterface,
    "Consultations",
    "Consultations_userId_fkey",
    {
      fields: ["userId"],
      type: "foreign key",
      references: {
        table: "users",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    }
  );

  await addConstraintIfMissing(
    queryInterface,
    "Consultations",
    "Consultations_providerId_fkey",
    {
      fields: ["providerId"],
      type: "foreign key",
      references: {
        table: "providers",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    }
  );

  console.log("Consultation schema repaired");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.sequelize.close();
  });
