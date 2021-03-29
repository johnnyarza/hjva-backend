const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface) => {
    queryInterface.createTable('productsFiles', {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
      },
      product_id: {
        type: DataTypes.UUID,
        references: { model: 'products', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        allowNull: true,
      },
      name: { type: DataTypes.STRING, allowNull: false },
      path: { type: DataTypes.STRING, allowNull: false, unique: true },
      created_at: { type: DataTypes.DATE, allowNull: false },
      updated_at: { type: DataTypes.DATE, allowNull: false },
    });
  },

  down: async (queryInterface) => {
    queryInterface.dropTable('productsFiles');
  },
};
