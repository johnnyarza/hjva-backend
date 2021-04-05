import Sequelize, { Model } from 'sequelize';
import { v4 as uuid } from 'uuid';

class Category extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
      },
      {
        hooks: {
          beforeCreate: (category, _) => {
            category.id = uuid();
          },
        },
        sequelize,
        tableName: 'categories',
      }
    );
    return this;
  }
}

export default Category;
