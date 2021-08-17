import Sequelize, { Model } from 'sequelize';
import { v4 as uuid } from 'uuid';
import ConcreteDesignMaterial from './ConcreteDesignMaterial';

class Material extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        notes: Sequelize.STRING,
        toSell: { type: Sequelize.BOOLEAN, field: 'toSell' },
        stockQty: {
          type: Sequelize.DECIMAL,
          field: 'stock_qty',
        },
        price: Sequelize.DECIMAL,
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
    this.hasMany(models.MaterialFile, {
      foreignKey: 'material_id',
      as: 'file',
    });
    this.belongsToMany(models.ConcreteDesign, {
      through: ConcreteDesignMaterial,
      as: 'concreteDesign',
    });
  }
}

export default Material;
