"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _yup = require('yup'); var Yup = _interopRequireWildcard(_yup);
var _Category = require('../../database/models/Category'); var _Category2 = _interopRequireDefault(_Category);
var _Material = require('../../database/models/Material'); var _Material2 = _interopRequireDefault(_Material);
var _Product = require('../../database/models/Product'); var _Product2 = _interopRequireDefault(_Product);
var _User = require('../../database/models/User'); var _User2 = _interopRequireDefault(_User);

class CategoryController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ message: 'Erro de validação' });
    }

    const categoryExists = await _Category2.default.findOne({
      where: { name: req.body.name },
    });

    if (categoryExists) {
      return res.status(400).json({ message: 'Categoria já existe' });
    }

    const category = await _Category2.default.create(req.body);
    return res.json(category);
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { userId: requestingId } = req;
      const requestingUser = await _User2.default.findByPk(requestingId);
      const schema = Yup.object().shape({
        name: Yup.string().required(),
      });

      if (!(await schema.isValid(req.body))) {
        return res.status(400).json({ message: 'Erro de validação' });
      }

      if (!id) {
        return res
          .status(400)
          .json({ message: 'Id da categoria não informado' });
      }

      const oldCategory = await _Category2.default.findByPk(id);

      if (!oldCategory) {
        return res.status(404).json({ message: 'Categoria no encontrada' });
      }

      if (!requestingUser) {
        return res.status(404).json({ message: 'Requesting user not found' });
      }

      const { role } = requestingUser;

      if (!(role === 'admin' || role === 'escritorio')) {
        return res
          .status(403)
          .json({ message: 'Usuario no tiene suficientes privilegios ' });
      }

      await _Category2.default.update(req.body, { where: { id } });

      const category = await _Category2.default.findByPk(id);

      return res.json(category);
    } catch (error) {
      return next(error);
    }
  }

  async index(req, res) {
    const categories = await _Category2.default.findAll();
    return res.json(categories);
  }

  async findByName(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ message: 'Erro de validação' });
    }

    const category = await _Category2.default.findOne({
      where: { name: req.body.name },
    });

    return res.json(category);
  }

  async delete(req, res) {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: 'Id da categoria não informado' });
    }

    const product = await _Product2.default.findOne({ where: { category_id: id } });
    const material = await _Material2.default.findOne({ where: { category_id: id } });

    if (product || material) {
      return res
        .status(403)
        .json({ message: 'Existe producto(s) utilizando esta categoria' });
    }

    await _Category2.default.destroy({ where: { id } });

    return res.json('Categoria deletada');
  }
}

exports. default = new CategoryController();
