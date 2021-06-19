"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _yup = require('yup'); var Yup = _interopRequireWildcard(_yup);

var _Product = require('../../database/models/Product'); var _Product2 = _interopRequireDefault(_Product);
var _User = require('../../database/models/User'); var _User2 = _interopRequireDefault(_User);
var _ProductFile = require('../../database/models/ProductFile'); var _ProductFile2 = _interopRequireDefault(_ProductFile);
var _Category = require('../../database/models/Category'); var _Category2 = _interopRequireDefault(_Category);

var _utils = require('../utils/utils'); var _utils2 = _interopRequireDefault(_utils);

class ProductController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      category: Yup.string().required(),
      description: Yup.string(),
      price: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Erro de validação' });
    }
    const user = await _User2.default.findByPk(req.userId);

    if (!_utils2.default.productsGrantedAccess.find((role) => role === user.role)) {
      return res
        .status(403)
        .json({ error: 'Usuário não tem privilégios necessários' });
    }
    const category = await _Category2.default.findOne({
      where: {
        name: req.body.category,
      },
    });
    if (!category) {
      return res.status(400).send('Categoria informada não foi encontrada');
    }
    const { id: category_id } = category;
    const { id } = await _Product2.default.create({ category_id, ...req.body });

    const response = await _Product2.default.findByPk(id, {
      include: {
        model: _Category2.default,
        as: 'category',
        attributes: ['name'],
      },
    });
    const product = response.dataValues;
    product.category = product.category.name;

    return res.json(product);
  }

  async index(req, res) {
    const data = await _Product2.default.findAll({
      include: [
        { model: _ProductFile2.default, as: 'file' },
        { model: _Category2.default, as: 'category', attributes: ['name'] },
      ],
      order: [['name', 'ASC']],
    });

    const products = data.map(
      ({
        id,
        name,
        description,
        price,
        file,
        category,
        createdAt,
        updatedAt,
      }) => ({
        id,
        name,
        category: category.name,
        description,
        price,
        file,
        createdAt,
        updatedAt,
      })
    );
    return res.json(products);
  }

  async findById(req, res) {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Id do produto não informado' });
    }

    const data = await _Product2.default.findByPk(id, {
      include: [
        { model: _ProductFile2.default, as: 'file' },
        { model: _Category2.default, as: 'category', attributes: ['name'] },
      ],
    });

    const {
      id: idNew,
      name,
      description,
      file,
      category,
      createdAt,
      updatedAt,
      price,
    } = data;
    const product = {
      id: idNew,
      name,
      category: category.name,
      description,
      price,
      file,
      createdAt,
      updatedAt,
    };

    return res.json(product);
  }

  async update(req, res) {
    // acrescentar atualização de categoria
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Id do produto não foi informado' });
    }

    const schema = Yup.object().shape({
      name: Yup.string(),
      category: Yup.string(),
      description: Yup.string(),
      price: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Erro de validação' });
    }

    const user = await _User2.default.findByPk(req.userId);

    const category = (
      await _Category2.default.findOne({
        where: { name: req.body.category },
      })
    ).dataValues;

    if (!category) {
      return res.status(400).json({ error: 'Categoria não encontrada' });
    }

    if (!_utils2.default.productsGrantedAccess.find((role) => role === user.role)) {
      return res
        .status(403)
        .json({ error: 'Usuário não tem privilégios necessários' });
    }

    req.body.category_id = category.id;

    await _Product2.default.update(req.body, {
      where: { id },
    });

    const product = (
      await _Product2.default.findByPk(id, {
        include: [
          { model: _ProductFile2.default, as: 'file' },
          { model: _Category2.default, as: 'category', attributes: ['id', 'name'] },
        ],
      })
    ).dataValues;

    delete product.category_id;
    product.category = product.category.name;

    return res.json(product);
  }

  async delete(req, res) {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Id do produto não informado' });
    }

    const user = await _User2.default.findByPk(req.userId);

    if (!_utils2.default.productsGrantedAccess.find((role) => role === user.role)) {
      return res
        .status(403)
        .json({ error: 'Usuário não tem privilégios necessários' });
    }

    const product = await _Product2.default.destroy({ where: { id } });

    return res.json({ affectedRows: product });
  }
}

exports. default = new ProductController();
