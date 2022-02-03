import Sequelize, { Model } from 'sequelize';
import { v4 as uuid } from 'uuid';

class Portifolio extends Model {
  static init(sequelize) {
    super.init(
      {
        title: Sequelize.STRING,
        paragraph: Sequelize.STRING,
      },
      {
        hooks: {
          beforeCreate: (portifolio, _) => {
            portifolio.id = uuid();
          },
        },
        sequelize,
      }
    );
    return this;
  }
}

export default Portifolio;
