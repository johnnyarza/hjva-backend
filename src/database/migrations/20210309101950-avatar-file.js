const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.createTable('avatar', {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.UUID,
        references: { model: 'users', key: 'id' },
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

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  },
};
