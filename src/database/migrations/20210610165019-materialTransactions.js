const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('material_transactions', {
      id: { type: DataTypes.UUID, allowNull: false, primaryKey: true },
      material_id: {
        type: DataTypes.UUID,
        references: { model: 'materials', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        allowNull: false,
      },
      provider_id: {
        type: DataTypes.UUID,
        references: { model: 'providers', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        allowNull: true,
      },
      client_id: {
        type: DataTypes.UUID,
        references: { model: 'clients', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        allowNull: true,
      },
      entry: {
        type: DataTypes.DECIMAL(10, 3),
        allowNull: false,
        defaultValue: 0.0,
      },
      previous_qty: {
        type: DataTypes.DECIMAL(10, 3),
        allowNull: false,
      },
      notes: { type: DataTypes.STRING, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('material_transactions');
  },
};
