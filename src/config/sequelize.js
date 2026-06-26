const { Sequelize } = require("sequelize");
const databaseConfig = require("./database");

const env = process.env.NODE_ENV || "development";
const config = databaseConfig[env];

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

module.exports = sequelize;