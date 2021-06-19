"use strict";const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.createTable('concrete_samples', {
      id: { type: DataTypes.UUID, allowNull: false, primaryKey: true },
      tracker: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        autoIncrement: true,
      },
      compression_test_id: {
        type: DataTypes.UUID,
        references: { model: 'compression_tests', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        allowNull: false,
      },
      concrete_design_id: {
        type: DataTypes.UUID,
        references: { model: 'concrete_designs', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        allowNull: false,
      },
      load: {
        type: DataTypes.DECIMAL(10, 3),
        allowNull: false,
        defaultValue: 0.0,
      },
      weight: {
        type: DataTypes.DECIMAL(10, 3),
        allowNull: false,
        defaultValue: 0.0,
      },
      height: {
        type: DataTypes.DECIMAL(10, 3),
        allowNull: false,
        defaultValue: 0.0,
      },
      diameter: {
        type: DataTypes.DECIMAL(10, 3),
        allowNull: false,
        defaultValue: 0.0,
      },
      slump: {
        type: DataTypes.DECIMAL(10, 3),
        allowNull: false,
        defaultValue: 0.0,
      },
      notes: { type: DataTypes.STRING, allowNull: true },
      sampled_at: { type: Sequelize.DATE, allowNull: false },
      loaded_at: { type: Sequelize.DATE, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('concrete_samples');
  },
};
