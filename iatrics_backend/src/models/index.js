"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const process = require("process");

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = require("../../config/config.js")[env];

const db = {};

let sequelize;

if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

const DataTypes = Sequelize.DataTypes;


// ✅ LOAD MODELS AFTER sequelize is ready
db.User = require("./user")(sequelize, DataTypes);
db.Provider = require("./provider")(sequelize, DataTypes);

// ✅ ADD YOUR NEW MODEL HERE (AFTER sequelize exists)
db.WalletTransaction = require("./walletTransaction")(sequelize, DataTypes);


// ✅ Attach sequelize
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;