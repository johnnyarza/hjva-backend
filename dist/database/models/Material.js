"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _sequelize = require('sequelize'); var _sequelize2 = _interopRequireDefault(_sequelize);
var _uuid = require('uuid');

class Material extends _sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        name: _sequelize2.default.STRING,
        notes: _sequelize2.default.STRING,
        stockQty: {
          type: _sequelize2.default.DECIMAL,
          field: 'stock_qty',
        },
      },
      {
        hooks: {
          beforeCreate: (material, _) => {
            material.id = _uuid.v4.call(void 0, );
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
    this.belongsTo(models.Category, {
      foreignKey: 'category_id',
      as: 'category',
    });
    this.belongsTo(models.Measure, {
      foreignKey: 'measurement_id',
      as: 'measurement',
    });
  }
}

exports. default = Material;
