const { v4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface
      .createTable('settings', {
        id: {
          type: Sequelize.DataTypes.UUID,
          allowNull: false,
          primaryKey: true,
        },
        name: {
          type: Sequelize.DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
        value: { type: Sequelize.DataTypes.STRING, defaultValue: '' },
        created_at: { type: Sequelize.DATE, allowNull: false },
        updated_at: { type: Sequelize.DATE, allowNull: false },
      })
      .then(() => {
        queryInterface.bulkInsert('settings', [
          {
            id: v4(),
            name: 'CONTACTME_TEXT',
            value: 'Insert text',
            created_at: new Date(),
            updated_at: new Date(),
          },
          {
            id: v4(),
            name: 'CONTACTME_IMG_URL',
            value: '',
            created_at: new Date(),
            updated_at: new Date(),
          },
        ]);
      });
  },

  down: async (queryInterface, Sequelize) => {
    queryInterface.dropTable('settings');
  },
};
