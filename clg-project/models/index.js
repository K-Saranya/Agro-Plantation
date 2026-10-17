'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

let sequelize;
const dialect = (process.env.DB_DIALECT || 'sqlite').toLowerCase();
if (dialect === 'mysql') {
  sequelize = new Sequelize(
    process.env.DB_NAME || config.database,
    process.env.DB_USER || config.username,
    process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : config.password,
    {
      host: process.env.DB_HOST || config.host,
      port: Number(process.env.DB_PORT || 3306),
      dialect: 'mysql',
      logging: false,
    }
  );
} else {
  const storage = process.env.DB_STORAGE || path.join(__dirname, '..', 'data', 'agro.sqlite');
  fs.mkdirSync(path.dirname(path.resolve(storage)), { recursive: true });
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.resolve(storage),
    logging: false,
  });
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
