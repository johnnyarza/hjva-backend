"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _sequelize = require('sequelize'); var _sequelize2 = _interopRequireDefault(_sequelize);
var _bcryptjs = require('bcryptjs'); var _bcryptjs2 = _interopRequireDefault(_bcryptjs);
var _uuid = require('uuid');

class User extends _sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        name: _sequelize2.default.STRING,
        email: _sequelize2.default.STRING,
        password: _sequelize2.default.VIRTUAL,
        password_hash: _sequelize2.default.STRING,
        role: _sequelize2.default.STRING,
      },
      {
        hooks: {
          beforeCreate: (user, _) => {
            user.id = _uuid.v4.call(void 0, );
          },
          beforeSave: async (user, _) => {
            if (user.password) {
              user.password_hash = await _bcryptjs2.default.hash(user.password, 8);
            }
          },
          beforeUpdate: async (user, _) => {
            if (user.password) {
              user.password_hash = await _bcryptjs2.default.hash(user.password, 8);
            }
          },
        },
        sequelize,
      }
    );
    return this;
  }

  checkPassword(password) {
    return _bcryptjs2.default.compare(password, this.password_hash);
  }

  static associate(models) {
    this.hasOne(models.Avatar, {
      foreignKey: 'user_id',
      as: 'avatar',
    });
  }
}

exports. default = User;
