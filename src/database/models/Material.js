import Sequelize, { Model } from 'sequelize';
import { v4 as uuid } from 'uuid';

class Material extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        notes: Sequelize.STRING,
        stockQty: {
          type: Sequelize.DECIMAL,
          field: 'stock_qty',
        },
      },
      {
        hooks: {
          beforeCreate: (material, _) => {
            material.id = uuid();
          },
        },
        sequelize,
      }
    );
    return this;
  }

  static associate(models) {
    this.belongsTo(models.Provider, {
      foreignKey: 'provider_id',
      as: 'provider',
    });
    this.belongsTo(models.Category, {
      foreignKey: 'category_id',
      as: 'category',
    });
    this.belongsTo(models.Measure, {
      foreignKey: 'measurement_id',
      as: 'measurement',
    });
  }
}

export default Material;
