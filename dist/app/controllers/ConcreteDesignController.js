"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _yup = require('yup'); var Yup = _interopRequireWildcard(_yup);

var _ConcreteDesign = require('../../database/models/ConcreteDesign'); var _ConcreteDesign2 = _interopRequireDefault(_ConcreteDesign);
var _ConcreteDesignMaterial = require('../../database/models/ConcreteDesignMaterial'); var _ConcreteDesignMaterial2 = _interopRequireDefault(_ConcreteDesignMaterial);
var _Material = require('../../database/models/Material'); var _Material2 = _interopRequireDefault(_Material);
var _Measure = require('../../database/models/Measure'); var _Measure2 = _interopRequireDefault(_Measure);

class ConcreteDesignController {
  async store(req, res, next) {
    const transaction = await _ConcreteDesign2.default.sequelize.transaction();
    try {
      const schema = Yup.object().shape({
        name: Yup.string().required(),
        slump: Yup.number(),
        notes: Yup.string(),
        concreteDesignMaterial: Yup.array().of(
          Yup.object().shape({
            material_id: Yup.string().required(),
            quantity_per_m3: Yup.number().required(),
          })
        ),
      });

      if (!(await schema.isValid(req.body))) {
        return res.status(400).json({ message: 'Erro de validação' });
      }

      const { name, notes } = req.body;

      const concreteDesign = await _ConcreteDesign2.default.create(
        { name, notes },
        { transaction }
      );

      const concreteDesignMaterial = req.body.concreteDesignMaterial.map(
        (c) => ({
          ...c,
          concrete_design_id: concreteDesign.id,
        })
      );

      await _ConcreteDesignMaterial2.default.bulkCreate(concreteDesignMaterial, {
        individualHooks: true,
        transaction,
      });

      await transaction.commit();

      const result = await _ConcreteDesign2.default.findByPk(concreteDesign.id, {
        include: [
          {
            model: _ConcreteDesignMaterial2.default,
            as: 'concreteDesignMaterial',
            attributes: ['id', 'quantity_per_m3'],
            include: [
              {
                model: _Material2.default,
                as: 'material',
                attributes: ['id', 'name'],
                include: [
                  {
                    model: _Measure2.default,
                    as: 'measurement',
                    attributes: ['id', 'abbreviation'],
                  },
                ],
              },
            ],
          },
        ],
      });

      return res.json(result);
    } catch (error) {
      await transaction.rollback();
      return next(error);
    }
  }

  async index(req, res, next) {
    try {
      const concreteDesings = await _ConcreteDesign2.default.findAll({
        include: [
          {
            model: _ConcreteDesignMaterial2.default,
            as: 'concreteDesignMaterial',
            attributes: ['id', 'quantity_per_m3'],
            include: [
              {
                model: _Material2.default,
                as: 'material',
                attributes: ['id', 'name'],
                include: [
                  {
                    model: _Measure2.default,
                    as: 'measurement',
                    attributes: ['id', 'abbreviation'],
                  },
                ],
              },
            ],
          },
        ],
      });
      return res.json(concreteDesings);
    } catch (error) {
      return next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const schema = Yup.object().shape({
        name: Yup.string().required(),
        slump: Yup.number(),
        notes: Yup.string(),
      });

      if (!(await schema.isValid(req.body))) {
        return res.status(400).json({ message: 'Validation error' });
      }

      const concreteDesignExists = await _ConcreteDesign2.default.findByPk(id);

      if (!concreteDesignExists) {
        return res.status(404).json({ message: 'Concrete Design not found' });
      }

      await _ConcreteDesign2.default.update(req.body, { where: { id } });

      const concreteDesign = await _ConcreteDesign2.default.findByPk(id, {
        include: [
          {
            model: _ConcreteDesignMaterial2.default,
            as: 'concreteDesignMaterial',
            attributes: ['id', 'quantity_per_m3'],
            include: [
              {
                model: _Material2.default,
                as: 'material',
                attributes: ['id', 'name'],
                include: [
                  {
                    model: _Measure2.default,
                    as: 'measurement',
                    attributes: ['id', 'abbreviation'],
                  },
                ],
              },
            ],
          },
        ],
      });

      return res.json(concreteDesign);
    } catch (error) {
      return next(error);
    }
  }

  async delete(req, res, next) {
    const transaction = await _ConcreteDesign2.default.sequelize.transaction();
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ message: 'ConcreteDesign id empty' });
      }

      const affectedRows = await _ConcreteDesign2.default.destroy({
        where: { id },
        transaction,
      });

      transaction.commit();
      return res.json(affectedRows);
    } catch (error) {
      transaction.rollback();
      return next(error);
    }
  }
}
exports. default = new ConcreteDesignController();
