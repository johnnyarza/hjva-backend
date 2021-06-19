"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _sequelize = require('sequelize'); var _sequelize2 = _interopRequireDefault(_sequelize);
var _uuid = require('uuid');
var _datefns = require('date-fns');

class ConcreteSample extends _sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        load: _sequelize2.default.DECIMAL(10, 3),
        weight: _sequelize2.default.DECIMAL(10, 3),
        height: _sequelize2.default.DECIMAL(10, 3),
        diameter: _sequelize2.default.DECIMAL(10, 3),
        slump: _sequelize2.default.DECIMAL(10, 3),
        notes: _sequelize2.default.STRING,
        days: {
          type: _sequelize2.default.VIRTUAL,
          get() {
            return _datefns.differenceInDays.call(void 0, new Date(), this.getDataValue('sampledAt'));
          },
        },
        sampledAt: { type: _sequelize2.default.DATE, field: 'sampled_at' },
        loadedAt: _sequelize2.default.DATE,
      },
      {
        hooks: {
          beforeCreate: (c, _) => {
            c.id = _uuid.v4.call(void 0, );
          },
          afterFind: (c, _) => {
            if (c) {
              c.days = _datefns.differenceInDays.call(void 0, new Date(), c.sampledAt);
            }
          },
        },
        sequelize,
        tableName: 'concrete_samples',
      }
    );
    return this;
  }

  static associate(models) {
    this.belongsTo(models.CompressionTest, {
      foreignKey: 'compression_test_id',
      as: 'compressionTest',
    });
    this.belongsTo(models.ConcreteDesign, {
      foreignKey: 'concrete_design_id',
      as: 'concreteDesign',
    });
  }
}

exports. default = ConcreteSample;
