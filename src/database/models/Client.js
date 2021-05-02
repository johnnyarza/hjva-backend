import Sequelize, { Model } from 'sequelize';
import { v4 as uuid } from 'uuid';

class Client extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        address: Sequelize.STRING,
        phone: Sequelize.STRING,
        notes: Sequelize.STRING,
      },
      {
        hooks: {
          beforeCreate: (client, _) => {
            client.id = uuid();
          },
        },
        sequelize,
      }
    );
    return this;
  }
}

export default Client;
