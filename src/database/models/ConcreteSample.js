import Sequelize, { Model } from 'sequelize';
import { v4 as uuid } from 'uuid';
import { differenceInDays } from 'date-fns';

class ConcreteSample extends Model {
  static init(sequelize) {
    super.init(
      {
        load: Sequelize.DECIMAL(10, 3),
        weight: Sequelize.DECIMAL(10, 3),
        height: Sequelize.DECIMAL(10, 3),
        diameter: Sequelize.DECIMAL(10, 3),
        slump: Sequelize.DECIMAL(10, 3),
        notes: Sequelize.STRING,
        days: {
          type: Sequelize.VIRTUAL,
          get() {
            return differenceInDays(new Date(), this.getDataValue('sampledAt'));
          },
        },
        sampledAt: { type: Sequelize.DATE, field: 'sampled_at' },
        loadedAt: Sequelize.DATE,
      },
      {
        hooks: {
          beforeCreate: (c, _) => {
            c.id = uuid();
          },
          afterFind: (c, _) => {
            if (c) {
              c.days = differenceInDays(new Date(), c.sampledAt);
            }
          },
        },
        sequelize,
        tableName: 'concrete_samples',
      }
    );
    return this;
  }

  static associate(models) {
    this.belongsTo(models.CompressionTest, {
      foreignKey: 'compression_test_id',
      as: 'compressionTest',
    });
    this.belongsTo(models.ConcreteDesign, {
      foreignKey: 'concrete_design_id',
      as: 'concreteDesign',
    });
  }
}

export default ConcreteSample;
