import Sequelize, { Model } from 'sequelize';
import { v4 as uuid } from 'uuid';

class ConcreteDesign extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING(3),
        slump: Sequelize.DECIMAL,
        notes: Sequelize.STRING,
      },
      {
        hooks: {
          beforeCreate: (measure, _) => {
            measure.id = uuid();
          },
        },
        sequelize,
        tableName: 'concrete_designs',
      }
    );
    return this;
  }

  static associate(models) {
    this.hasMany(models.ConcreteDesignMaterial, {
      foreignKey: 'concrete_design_id',
      as: 'concreteDesignMaterial',
    });
  }
}

export default ConcreteDesign;
