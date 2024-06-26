'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class testimonial extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  testimonial.init({
    name: DataTypes.STRING,
    img: DataTypes.STRING,
    content: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'testimonial',
  });
  return testimonial;
};