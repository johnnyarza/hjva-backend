import Sequelize, { Model } from 'sequelize';
import { v4 as uuid } from 'uuid';

class Product extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        description: Sequelize.STRING,
        categoryId: { type: Sequelize.UUID, field: 'category_id' },
      },
      {
        hooks: {
          beforeCreate: (product, _) => {
            product.id = uuid();
          },
        },
        sequelize,
      }
    );
    return this;
  }

  static associate(models) {
    this.hasMany(models.ProductFile, {
      foreignKey: 'product_id',
      as: 'file',
    });
    this.belongsTo(models.Category, {
      foreignKey: 'category_id',
      as: 'category',
    });
  }
}

export default Product;
