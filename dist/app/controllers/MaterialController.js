"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _yup = require('yup'); var Yup = _interopRequireWildcard(_yup);
var _Material = require('../../database/models/Material'); var _Material2 = _interopRequireDefault(_Material);
var _Provider = require('../../database/models/Provider'); var _Provider2 = _interopRequireDefault(_Provider);
var _User = require('../../database/models/User'); var _User2 = _interopRequireDefault(_User);
var _Category = require('../../database/models/Category'); var _Category2 = _interopRequireDefault(_Category);
var _Measure = require('../../database/models/Measure'); var _Measure2 = _interopRequireDefault(_Measure);

class MaterialController {
  async store(req, res, next) {
    try {
      const schema = Yup.object().shape({
        name: Yup.string().required(),
        categoryId: Yup.string().required(),
        providerId: Yup.string().required(),
        measurementId: Yup.string().required(),
        notes: Yup.string(),
      });

      if (!(await schema.isValid(req.body))) {
        return res.status(400).json({ message: 'Erro de validação' });
      }

      const provider = await _Provider2.default.findByPk(req.body.providerId);
      const category = await _Category2.default.findByPk(req.body.categoryId);
      const measurement = await _Measure2.default.findByPk(req.body.measurementId);

      if (!provider || !category || !measurement) {
        let message;
        if (!provider) message = 'Provider';
        if (!category) message = 'Category';
        if (!measurement) message = 'Measure';
        return res.status(404).json({
          message: `${message} not found`,
        });
      }

      const {
        name,
        providerId: provider_id,
        categoryId: category_id,
        measurementId: measurement_id,
        notes,
      } = req.body;

      let material = await _Material2.default.create({
        name,
        provider_id,
        category_id,
        measurement_id,
        notes,
      });

      material = await _Material2.default.findByPk(material.id, {
        attributes: [
          'id',
          'name',
          'notes',
          'stockQty',
          'created_at',
          'updated_at',
        ],
        include: [
          {
            model: _Provider2.default,
            as: 'provider',
          },
          {
            model: _Category2.default,
            as: 'category',
          },
          {
            model: _Measure2.default,
            as: 'measurement',
          },
        ],
      });

      return res.json(material);
    } catch (error) {
      return next(error);
    }
  }

  async index(req, res, next) {
    try {
      const materials = await _Material2.default.findAll({
        attributes: [
          'id',
          'name',
          'notes',
          'stockQty',
          'created_at',
          'updated_at',
        ],
        include: [
          {
            model: _Provider2.default,
            as: 'provider',
            attributes: ['id', 'name', 'email', 'address', 'phone', 'notes'],
          },
          {
            model: _Category2.default,
            as: 'category',
            attributes: ['id', 'name'],
          },
          {
            model: _Measure2.default,
            as: 'measurement',
            attributes: ['id', 'abbreviation'],
          },
        ],
      });
      return res.json(materials);
    } catch (error) {
      return next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { userId: requestingId } = req;
      const requestingUser = await _User2.default.findByPk(requestingId);

      const schema = Yup.object().shape({
        name: Yup.string(),
        categoryId: Yup.string(),
        providerId: Yup.string(),
        notes: Yup.string(),
        measurementId: Yup.string(),
      });

      if (!id) {
        return res.status(400).json({ message: 'Product id is empty' });
      }

      if (!(await schema.isValid(req.body))) {
        return res.status(400).json({ message: 'Validation error' });
      }

      if (!requestingUser) {
        return res.status(404).json({ message: 'Requesting user not found' });
      }

      const { role } = requestingUser;

      if (!(role === 'admin' || role === 'escritorio')) {
        return res
          .status(403)
          .json({ message: 'User does not have enough privileges' });
      }

      const {
        providerId: provider_id,
        categoryId: category_id,
        measurementId: measurement_id,
      } = req.body;

      if (provider_id) {
        const provider = await _Provider2.default.findByPk(req.body.providerId);
        if (!provider) {
          return res.status(404).json({ message: 'Provider not found' });
        }
        req.body.provider_id = provider_id;
      }

      if (category_id) {
        const category = await _Category2.default.findByPk(req.body.categoryId);
        if (!category) {
          return res.status(404).json({ message: 'Category not found' });
        }
        req.body.category_id = category_id;
      }

      if (measurement_id) {
        const measure = await _Measure2.default.findByPk(req.body.measurementId);
        if (!measure) {
          return res.status(404).json({ message: 'Measure not found' });
        }
        req.body.measurement_id = measurement_id;
      }

      await _Material2.default.update(req.body, { where: { id } });

      const material = await _Material2.default.findByPk(id, {
        attributes: ['id', 'name', 'notes', 'created_at', 'updated_at'],
        include: [
          {
            model: _Provider2.default,
            as: 'provider',
          },
          {
            model: _Category2.default,
            as: 'category',
          },
          {
            model: _Measure2.default,
            as: 'measurement',
          },
        ],
      });

      return res.json(material);
    } catch (error) {
      return next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const { userId: requestingId } = req;

      if (!id) {
        return res.status(400).json({ message: 'Product id is empty' });
      }
      if (!requestingId) {
        return res.status(400).json({ message: 'Requesting user id is empty' });
      }

      const requestingUser = await _User2.default.findByPk(requestingId);

      if (!requestingUser) {
        return res.status(404).json({ message: 'Requesting user not found' });
      }

      const { role } = requestingUser;

      if (!(role === 'admin' || role === 'escritorio')) {
        return res
          .status(403)
          .json({ message: 'User does not have enough privileges' });
      }

      const affectedRows = await _Material2.default.destroy({ where: { id } });

      return res.json(affectedRows);
    } catch (error) {
      return next(error);
    }
  }
}

exports. default = new MaterialController();
