import Sequelize, { Model } from 'sequelize';
import { v4 as uuid } from 'uuid';

class ConcreteDesignMaterial extends Model {
  static init(sequelize) {
    super.init(
      {
        quantity_per_m3: Sequelize.DECIMAL,
      },
      {
        hooks: {
          beforeCreate: (c, _) => {
            c.id = uuid();
          },
        },
        sequelize,
        tableName: 'concrete_design_materials',
      }
    );
    return this;
  }

  static associate(models) {
    this.belongsTo(models.Material, {
      foreignKey: 'material_id',
      as: 'material',
    });
    this.belongsTo(models.ConcreteDesign, {
      foreignKey: 'concrete_design_id',
      as: 'concreteDesign',
    });
  }
}

export default ConcreteDesignMaterial;