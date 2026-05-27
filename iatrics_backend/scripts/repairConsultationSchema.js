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

async function addColumnIfMissing(queryInterface, tableName, table, columnName, definition) {
  if (!table[columnName]) {
    await queryInterface.addColumn(tableName, columnName, definition);
    console.log(`Added ${tableName}.${columnName}`);
  } else {
    console.log(`${tableName}.${columnName} already exists`);
  }
}

async function main() {
  const queryInterface = db.sequelize.getQueryInterface();
  const Sequelize = db.Sequelize;
  const tableName = "Consultations";
  const table = await queryInterface.describeTable(tableName);

  await addColumnIfMissing(queryInterface, tableName, table, "type", {
    type: Sequelize.STRING,
  });
  await addColumnIfMissing(queryInterface, tableName, table, "channelName", {
    type: Sequelize.STRING,
  });
  await addColumnIfMissing(queryInterface, tableName, table, "symptoms", {
    type: Sequelize.TEXT,
  });
  await addColumnIfMissing(queryInterface, tableName, table, "appointmentDate", {
    type: Sequelize.DATEONLY,
  });
  await addColumnIfMissing(queryInterface, tableName, table, "appointmentTime", {
    type: Sequelize.STRING,
  });
  await addColumnIfMissing(queryInterface, tableName, table, "duration", {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0,
  });
  await addColumnIfMissing(queryInterface, tableName, table, "fee", {
    type: Sequelize.FLOAT,
  });
  await addColumnIfMissing(queryInterface, tableName, table, "price", {
    type: Sequelize.FLOAT,
  });
  await addColumnIfMissing(queryInterface, tableName, table, "status", {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: "pending",
  });

  await dropConstraintIfExists(
    queryInterface,
    tableName,
    "Consultations_userId_fkey"
  );
  await dropConstraintIfExists(
    queryInterface,
    tableName,
    "Consultations_providerId_fkey"
  );

  await addConstraintIfMissing(
    queryInterface,
    tableName,
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
    tableName,
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
