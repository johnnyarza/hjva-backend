import Sequelize, { Model } from 'sequelize';
import { v4 as uuid } from 'uuid';

class Avatar extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        path: Sequelize.STRING,
        user_id: Sequelize.UUID,
        url: {
          type: Sequelize.VIRTUAL,
          get() {
            return `${process.env.APP_URL}/files/${this.path}`;
          },
        },
      },
      {
        hooks: {
          beforeCreate: (avatar, _) => {
            avatar.id = uuid();
          },
        },
        sequelize,
      }
    );
    return this;
  }
}

export default Avatar;
