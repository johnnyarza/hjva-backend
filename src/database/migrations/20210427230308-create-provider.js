const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.createTable('providers', {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
      },
      name: { type: DataTypes.STRING, allowNull: false, unique: true },
      address: { type: DataTypes.STRING, allowNull: true },
      phone: { type: DataTypes.STRING, allowNull: true },
      notes: { type: DataTypes.STRING, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },

  down: async (queryInterface, Sequelize) => {
    queryInterface.dropTable('providers');
  },
};
