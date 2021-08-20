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
        mPa: {
          type: Sequelize.VIRTUAL,
          get() {
            const load = this.getDataValue('load');
            const diameter = this.getDataValue('diameter');
            if (load && diameter) {
              const areaM2 =
                (Math.PI * (diameter * diameter)) / 4 / (100 * 100);
              const loadNewton = load * 9806.65;
              const megaNewton = loadNewton / areaM2 / 1000000;
              return megaNewton;
            }
            return 0;
          },
        },
        days: {
          type: Sequelize.VIRTUAL,
          get() {
            const load = this.getDataValue('load');
            const date = load > 0 ? this.getDataValue('loadedAt') : new Date();
            return differenceInDays(date, this.getDataValue('sampledAt'));
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
