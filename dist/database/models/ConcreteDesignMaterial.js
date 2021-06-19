"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _sequelize = require('sequelize'); var _sequelize2 = _interopRequireDefault(_sequelize);
var _uuid = require('uuid');

class ConcreteDesignMaterial extends _sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        quantity_per_m3: _sequelize2.default.DECIMAL,
      },
      {
        hooks: {
          beforeCreate: (c, _) => {
            c.id = _uuid.v4.call(void 0, );
          },
        },
        sequelize,
        tableName: 'concrete_design_materials',
      }
    );
    return this;
  }

  static associate(models) {
    this.belongsTo(models.Material, {
      foreignKey: 'material_id',
      as: 'material',
    });
    this.belongsTo(models.ConcreteDesign, {
      foreignKey: 'concrete_design_id',
      as: 'concreteDesign',
    });
  }
}

exports. default = ConcreteDesignMaterial;
