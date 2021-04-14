import Sequelize, { Model } from 'sequelize';
import { v4 as uuid } from 'uuid';

class Role extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
      },
      {
        hooks: {
          beforeCreate: (role, _) => {
            role.id = uuid();
          },
        },
        sequelize,
        tableName: 'roles',
      }
    );
    return this;
  }
}

export default Role;
