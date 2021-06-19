"use strict";const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.createTable('users', {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
      },
      name: { type: DataTypes.STRING, allowNull: false, unique: true },
      email: { type: DataTypes.STRING, allowNull: false, unique: true },
      role: {
        type: DataTypes.STRING,
        validate: { isIn: [['admin', 'office', 'seller', 'lab', 'common']] },
        references: { model: 'roles', key: 'name' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        defaultValue: 'comum',
        allowNull: false,
      },
      password_hash: { type: DataTypes.STRING, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    }),

  down: async (queryInterface) => queryInterface.dropTable('users'),
};
