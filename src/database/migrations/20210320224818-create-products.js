const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface) => {
    queryInterface.createTable('products', {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
      },
      name: { type: DataTypes.STRING, allowNull: false },
      category: { type: DataTypes.STRING, allowNull: false },
      description: { type: DataTypes.STRING, allowNull: true },
      created_at: { type: DataTypes.DATE, allowNull: false },
      updated_at: { type: DataTypes.DATE, allowNull: false },
    });
  },

  down: async (queryInterface) => {
    queryInterface.dropTable('products');
  },
};
