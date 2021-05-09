import Sequelize, { Model } from 'sequelize';
import { v4 as uuid } from 'uuid';

class Provider extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        email: Sequelize.STRING,
        address: Sequelize.STRING,
        phone: Sequelize.STRING,
        notes: Sequelize.STRING,
      },
      {
        hooks: {
          beforeCreate: (provider, _) => {
            provider.id = uuid();
          },
        },
        sequelize,
      }
    );
    return this;
  }
}

export default Provider;
