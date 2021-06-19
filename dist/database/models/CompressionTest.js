"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _sequelize = require('sequelize'); var _sequelize2 = _interopRequireDefault(_sequelize);
var _uuid = require('uuid');

class CompressionTest extends _sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        notes: _sequelize2.default.STRING,
        hasWarning: {
          type: _sequelize2.default.VIRTUAL,
        },
      },
      {
        hooks: {
          beforeCreate: (c, _) => {
            c.id = _uuid.v4.call(void 0, );
          },
        },
        sequelize,
      }
    );
    return this;
  }

  static associate(models) {
    this.belongsTo(models.ConcreteDesign, {
      foreignKey: 'concrete_design_id',
      as: 'concreteDesign',
    });
    this.belongsTo(models.Client, {
      foreignKey: 'client_id',
      as: 'client',
    });
    this.belongsTo(models.Client, {
      foreignKey: 'concrete_provider_id',
      as: 'concreteProvider',
    });
  }
}

exports. default = CompressionTest;
