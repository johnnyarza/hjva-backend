import Sequelize, { Model } from 'sequelize';
import { v4 as uuid } from 'uuid';
import User from './User';

class MaterialTransaction extends Model {
  static init(sequelize) {
    super.init(
      {
        entry: Sequelize.DECIMAL,
        previousQty: { type: Sequelize.DECIMAL, field: 'previous_qty' },
        notes: Sequelize.STRING,
        materialId: {
          type: Sequelize.UUID,
          field: 'material_id',
        },
        clientId: {
          type: Sequelize.UUID,
          field: 'client_id',
        },
        providerId: {
          type: Sequelize.UUID,
          field: 'provider_id',
        },
      },
      {
        hooks: {
          beforeCreate: (materialTransaction, _) => {
            materialTransaction.id = uuid();
          },
        },
        sequelize,
        tableName: 'material_transactions',
      }
    );
    return this;
  }

  static associate(models) {
    this.belongsTo(models.Provider, {
      foreignKey: 'provider_id',
      as: 'provider',
    });
    this.belongsTo(models.Client, {
      foreignKey: 'client_id',
      as: 'client',
    });
    this.belongsTo(models.Material, {
      foreignKey: 'material_id',
      as: 'material',
    });
  }
}

export default MaterialTransaction;
