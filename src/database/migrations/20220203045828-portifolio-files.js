const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface) => {
    queryInterface.createTable('portifolio_files', {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
      },
      portifolio_id: {
        type: DataTypes.UUID,
        references: { model: 'portifolios', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        allowNull: false,
      },
      name: { type: DataTypes.STRING, allowNull: false },
      key: { type: DataTypes.STRING, allowNull: false, unique: true },
      url: {
        type: DataTypes.STRING,
        unique: true,
        defaultValue: '',
      },
      created_at: { type: DataTypes.DATE, allowNull: false },
      updated_at: { type: DataTypes.DATE, allowNull: false },
    });
  },

  down: async (queryInterface) => {
    queryInterface.dropTable('portifolio_files');
  },
};
