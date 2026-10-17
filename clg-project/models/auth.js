'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class auth extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  auth.init({
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    forgetpassword: DataTypes.STRING,
    token: DataTypes.STRING(512),
    role: { type: DataTypes.STRING, defaultValue: 'customer' }
  }, {
    sequelize,
    modelName: 'auth',
  });
  return auth;
};