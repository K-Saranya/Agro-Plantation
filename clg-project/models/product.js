'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  product.init({
    name: DataTypes.STRING,
    img: DataTypes.STRING,
    price: DataTypes.INTEGER,
    dec: DataTypes.STRING,
    quantety: DataTypes.INTEGER,
    cover1: DataTypes.STRING,
    cover2: DataTypes.STRING,
    cover3: DataTypes.STRING,
    cover4: DataTypes.STRING,
    category: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'product',
  });
  return product;
};