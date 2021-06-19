"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _sequelize = require('sequelize'); var _sequelize2 = _interopRequireDefault(_sequelize);
var _uuid = require('uuid');

class Product extends _sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        name: _sequelize2.default.STRING,
        description: _sequelize2.default.STRING,
        category_id: { type: _sequelize2.default.UUID },
        price: _sequelize2.default.DECIMAL,
      },
      {
        hooks: {
          beforeCreate: (product, _) => {
            product.id = _uuid.v4.call(void 0, );
          },
        },
        sequelize,
      }
    );
    return this;
  }

  static associate(models) {
    this.hasMany(models.ProductFile, {
      foreignKey: 'product_id',
      as: 'file',
    });
    this.belongsTo(models.Category, {
      foreignKey: 'category_id',
      as: 'category',
    });
  }
}

exports. default = Product;
