'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('products', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      img: {
        type: Sequelize.STRING
      },
      price: {
        type: Sequelize.INTEGER
      },
      dec: {
        type: Sequelize.STRING
      },
      quantety: {
        type: Sequelize.INTEGER
      },
      cover1: {
        type: Sequelize.STRING
      },
      cover2: {
        type: Sequelize.STRING
      },
      cover3: {
        type: Sequelize.STRING
      },
      cover4: {
        type: Sequelize.STRING
      },
      category: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('products');
  }
};