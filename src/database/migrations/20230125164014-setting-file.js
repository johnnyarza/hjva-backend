const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.createTable('setting_files', {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
      },
      setting_id: {
        type: DataTypes.UUID,
        references: { model: 'settings', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        allowNull: false,
        unique: true,
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

  down: async (queryInterface, Sequelize) => {
    queryInterface.dropTable('setting_files');
  },
};
