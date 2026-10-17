"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class customerOrder extends Model {
    static associate() {}
  }
  customerOrder.init(
    {
      userId: DataTypes.INTEGER,
      orderNumber: DataTypes.STRING,
      items: DataTypes.JSON,
      billing: DataTypes.JSON,
      subtotal: DataTypes.INTEGER,
      shipping: DataTypes.INTEGER,
      total: DataTypes.INTEGER,
      paymentMethod: DataTypes.STRING,
      status: { type: DataTypes.STRING, defaultValue: "received" },
      notes: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "customerOrder",
      tableName: "orders",
    }
  );
  return customerOrder;
};
