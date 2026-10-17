"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class contactMessage extends Model {
    static associate() {}
  }
  contactMessage.init(
    {
      name: DataTypes.STRING,
      email: DataTypes.STRING,
      phone: DataTypes.STRING,
      message: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "contactMessage",
      tableName: "contacts",
    }
  );
  return contactMessage;
};
