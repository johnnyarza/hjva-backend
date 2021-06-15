import Sequelize, { Model } from 'sequelize';
import { v4 as uuid } from 'uuid';

class CompressionTest extends Model {
  static init(sequelize) {
    super.init(
      {
        notes: Sequelize.STRING,
        hasWarning: {
          type: Sequelize.VIRTUAL,
        },
      },
      {
        hooks: {
          beforeCreate: (c, _) => {
            c.id = uuid();
          },
        },
        sequelize,
      }
    );
    return this;
  }

  static associate(models) {
    this.belongsTo(models.ConcreteDesign, {
      foreignKey: 'concrete_design_id',
      as: 'concreteDesign',
    });
    this.belongsTo(models.Client, {
      foreignKey: 'client_id',
      as: 'client',
    });
    this.belongsTo(models.Client, {
      foreignKey: 'concrete_provider_id',
      as: 'concreteProvider',
    });
  }
}

export default CompressionTest;
