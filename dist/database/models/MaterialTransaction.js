"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _sequelize = require('sequelize'); var _sequelize2 = _interopRequireDefault(_sequelize);
var _uuid = require('uuid');
var _User = require('./User'); var _User2 = _interopRequireDefault(_User);

class MaterialTransaction extends _sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        entry: _sequelize2.default.DECIMAL,
        previousQty: { type: _sequelize2.default.DECIMAL, field: 'previous_qty' },
        notes: _sequelize2.default.STRING,
        materialId: {
          type: _sequelize2.default.UUID,
          field: 'material_id',
        },
        clientId: {
          type: _sequelize2.default.UUID,
          field: 'client_id',
        },
        providerId: {
          type: _sequelize2.default.UUID,
          field: 'provider_id',
        },
      },
      {
        hooks: {
          beforeCreate: (materialTransaction, _) => {
            materialTransaction.id = _uuid.v4.call(void 0, );
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

exports. default = MaterialTransaction;
