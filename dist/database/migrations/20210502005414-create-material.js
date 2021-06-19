"use strict";const { DataTypes } = require('sequelize');
const { v4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.createTable('materials', {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
      },
      provider_id: {
        type: DataTypes.UUID,
        references: { model: 'providers', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        allowNull: false,
      },
      category_id: {
        type: DataTypes.UUID,
        references: { model: 'categories', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        allowNull: false,
      },
      measurement_id: {
        type: DataTypes.UUID,
        references: { model: 'measurements', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        allowNull: false,
      },
      stock_qty: {
        type: DataTypes.DECIMAL,
        allowNull: false,
        unique: false,
        defaultValue: 0.0,
      },
      name: { type: DataTypes.STRING, allowNull: false, unique: true },
      notes: { type: DataTypes.STRING, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },

  down: async (queryInterface, Sequelize) => {
    queryInterface.dropTable('materials');
  },
};
