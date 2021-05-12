import Sequelize, { Model } from 'sequelize';
import { v4 as uuid } from 'uuid';

class Material extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        notes: Sequelize.STRING,
        provider_id: Sequelize.UUID,
      },
      {
        hooks: {
          beforeCreate: (material, _) => {
            material.id = uuid();
          },
        },
        sequelize,
      }
    );
    return this;
  }

  static associate(models) {
    this.belongsTo(models.Provider, {
      foreignKey: 'provider_id',
      as: 'provider',
    });
  }
}

export default Material;
