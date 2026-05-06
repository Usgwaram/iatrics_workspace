"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const process = require("process");

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = require("../../config/config.js")[env];

const db = {};

// ✅ FIXED SEQUELIZE INIT
let sequelize;

if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], {
    dialect: config.dialect,
  });
} else {
  sequelize = new Sequelize(
    process.env.DATABASE_URL,
    {
      dialect: "postgres",
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
    }
  );
}

// attach properly
db.sequelize = sequelize;
db.Sequelize = Sequelize;

// models
db.User = require("./User")(sequelize, Sequelize.DataTypes);
db.Provider = require("./Provider")(sequelize, Sequelize.DataTypes);
db.WalletTransaction = require("./walletTransaction")(sequelize, Sequelize.DataTypes);

module.exports = db;