const { v4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface
      .createTable('portifolios', {
        id: {
          type: Sequelize.DataTypes.UUID,
          allowNull: false,
          primaryKey: true,
        },
        title: {
          type: Sequelize.DataTypes.STRING,
          defaultValue: '',
        },
        paragraph: { type: Sequelize.DataTypes.STRING, defaultValue: '' },
        created_at: { type: Sequelize.DATE, allowNull: false },
        updated_at: { type: Sequelize.DATE, allowNull: false },
      })
      .then(() => {
        queryInterface.bulkInsert('portifolios', [
          {
            id: v4(),
            title: 'Title',
            paragraph: 'Insert text',
            created_at: new Date(),
            updated_at: new Date(),
          },
        ]);
      });
  },

  down: async (queryInterface, Sequelize) => {
    queryInterface.dropTable('portifolios');
  },
};
