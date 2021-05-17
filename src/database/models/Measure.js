import Sequelize, { Model } from 'sequelize';
import { v4 as uuid } from 'uuid';

class Measure extends Model {
  static init(sequelize) {
    super.init(
      {
        abbreviation: Sequelize.STRING(3),
        notes: Sequelize.STRING,
      },
      {
        hooks: {
          beforeCreate: (measure, _) => {
            measure.id = uuid();
          },
        },
        sequelize,
        tableName: 'measurements',
      }
    );
    return this;
  }
}

export default Measure;
