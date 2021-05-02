const { DataTypes } = require('sequelize');

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
        onDelete: 'CASCADE',
        allowNull: false,
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
