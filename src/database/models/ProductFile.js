import Sequelize, { Model } from 'sequelize';
import { v4 as uuid } from 'uuid';

class ProductFile extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        path: Sequelize.STRING,
        product_id: Sequelize.UUID,
        url: {
          type: Sequelize.VIRTUAL,
          get() {
            return `${process.env.APP_URL}/files/${this.path}`;
          },
        },
      },
      {
        hooks: {
          beforeCreate: (user, _) => {
            user.id = uuid();
          },
        },
        sequelize,
        tableName: 'productsFiles',
      }
    );
    return this;
  }

  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'product_id', as: 'product' });
  }
}

export default ProductFile;
