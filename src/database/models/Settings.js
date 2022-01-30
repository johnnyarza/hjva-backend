import Sequelize, { Model } from 'sequelize';
import { v4 as uuid } from 'uuid';

class Settings extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        value: Sequelize.STRING,
      },
      {
        hooks: {
          beforeCreate: (setting, _) => {
            setting.id = uuid();
          },
        },
        sequelize,
      }
    );
    return this;
  }
}

export default Settings;
