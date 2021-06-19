"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _yup = require('yup'); var Yup = _interopRequireWildcard(_yup);
var _Provider = require('../../database/models/Provider'); var _Provider2 = _interopRequireDefault(_Provider);
var _User = require('../../database/models/User'); var _User2 = _interopRequireDefault(_User);

class ProviderController {
  async store(req, res, next) {
    try {
      const schema = Yup.object().shape({
        name: Yup.string().required(),
        email: Yup.string().email().notRequired(),
        address: Yup.string(),
        phone: Yup.string(),
        notes: Yup.string(),
      });

      if (!(await schema.isValid(req.body))) {
        return res.status(400).json({ error: 'Validation error' });
      }

      const provider = await _Provider2.default.create(req.body);

      return res.json(provider);
    } catch (error) {
      return next(error);
    }
  }

  async index(req, res, next) {
    try {
      const providers = await _Provider2.default.findAll();

      return res.json(providers);
    } catch (error) {
      return next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const schema = Yup.object().shape({
        name: Yup.string().required(),
        email: Yup.string().email(),
        address: Yup.string(),
        phone: Yup.string(),
      });

      if (!id) {
        return res.status(400).json({ error: 'Provider id não informado' });
      }

      if (!(await schema.isValid(req.body))) {
        return res.status(400).json({ error: 'Validation error' });
      }

      await _Provider2.default.update(req.body, {
        where: { id },
      });

      const provider = await _Provider2.default.findByPk(id);

      if (!provider) {
        return res.status(404).json({ error: 'Provider not found' });
      }

      return res.json(provider);
    } catch (error) {
      return next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const { userId } = req;

      if (!id || !userId) {
        return res
          .status(400)
          .json({ error: `${!id ? 'Client' : 'User'} id não informado` });
      }

      const user = await _User2.default.findByPk(userId);

      if (!(user.role === 'admin')) {
        return res
          .status(403)
          .json({ error: `Usuário não tem privilégios suficientes` });
      }

      const affectedRows = await _Provider2.default.destroy({ where: { id } });

      return res.json(affectedRows);
    } catch (error) {
      return next(error);
    }
  }
}

exports. default = new ProviderController();
