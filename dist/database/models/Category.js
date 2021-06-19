"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _sequelize = require('sequelize'); var _sequelize2 = _interopRequireDefault(_sequelize);
var _uuid = require('uuid');

class Category extends _sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        name: _sequelize2.default.STRING,
      },
      {
        hooks: {
          beforeCreate: (category, _) => {
            category.id = _uuid.v4.call(void 0, );
          },
        },
        sequelize,
        tableName: 'categories',
      }
    );
    return this;
  }
}

exports. default = Category;
