"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _sequelize = require('sequelize'); var _sequelize2 = _interopRequireDefault(_sequelize);
var _uuid = require('uuid');

class Client extends _sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        name: _sequelize2.default.STRING,
        email: _sequelize2.default.STRING,
        address: _sequelize2.default.STRING,
        phone: _sequelize2.default.STRING,
        notes: _sequelize2.default.STRING,
      },
      {
        hooks: {
          beforeCreate: (client, _) => {
            client.id = _uuid.v4.call(void 0, );
          },
        },
        sequelize,
      }
    );
    return this;
  }
}

exports. default = Client;
