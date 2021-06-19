"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _Role = require('../../database/models/Role'); var _Role2 = _interopRequireDefault(_Role);

class RoleController {
  async index(req, res) {
    try {
      const roles = await _Role2.default.findAll();
      return res.json(roles);
    } catch (error) {
      return res.status(500).json(error.message);
    }
  }
}

exports. default = new RoleController();
