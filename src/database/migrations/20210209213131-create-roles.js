const { DataTypes } = require('sequelize');
const { v4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface
      .createTable('roles', {
        id: {
          type: DataTypes.UUID,
          allowNull: false,
          primaryKey: true,
        },
        name: { type: DataTypes.STRING, allowNull: false, unique: true },
        created_at: { type: Sequelize.DATE, allowNull: false },
        updated_at: { type: Sequelize.DATE, allowNull: false },
      })
      .then(() => {
        queryInterface.bulkInsert('roles', [
          {
            id: v4(),
            name: 'admin',
            created_at: new Date(),
            updated_at: new Date(),
          },
          {
            id: v4(),
            name: 'comum',
            created_at: new Date(),
            updated_at: new Date(),
          },
          {
            id: v4(),
            name: 'escritorio',
            created_at: new Date(),
            updated_at: new Date(),
          },
          {
            id: v4(),
            name: 'vendedor',
            created_at: new Date(),
            updated_at: new Date(),
          },
          {
            id: v4(),
            name: 'laboratorio',
            created_at: new Date(),
            updated_at: new Date(),
          },
          {
            id: v4(),
            name: 'estoque',
            created_at: new Date(),
            updated_at: new Date(),
          },
        ]);
      });
  },

  down: async (queryInterface, Sequelize) => queryInterface.dropTable('roles'),
};
