Object.defineProperty(exports, '__esModule', { value: true });
function _interopRequireWildcard(obj) {
  if (obj && obj.__esModule) {
    return obj;
  }
  const newObj = {};
  if (obj != null) {
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        newObj[key] = obj[key];
      }
    }
  }
  newObj.default = obj;
  return newObj;
}
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}
const _yup = require('yup');

const Yup = _interopRequireWildcard(_yup);
const _ConcreteDesign = require('../../database/models/ConcreteDesign');

const _ConcreteDesign2 = _interopRequireDefault(_ConcreteDesign);
const _ConcreteDesignMaterial = require('../../database/models/ConcreteDesignMaterial');

const _ConcreteDesignMaterial2 = _interopRequireDefault(
  _ConcreteDesignMaterial
);
const _Material = require('../../database/models/Material');

const _Material2 = _interopRequireDefault(_Material);
const _Measure = require('../../database/models/Measure');

const _Measure2 = _interopRequireDefault(_Measure);

class ConcreteDesignMaterialController {
  async store(req, res, next) {
    const transaction = await _ConcreteDesignMaterial2.default.sequelize.transaction();
    try {
      const schema = Yup.array().of(
        Yup.object().shape({
          material_id: Yup.string().required(),
          concrete_design_id: Yup.string().required(),
          quantity_per_m3: Yup.number(),
        })
      );

      if (!(await schema.validate(req.body))) {
        return res.status(400).json({ message: 'Validation error' });
      }

      for (let i = 0; i < req.body.length; i += 1) {
        const { material_id, concrete_design_id } = req.body[i];
        // eslint-disable-next-line no-await-in-loop
        const material = await _Material2.default.findByPk(material_id);
        // eslint-disable-next-line no-await-in-loop
        const concreteDesign = await _ConcreteDesign2.default.findByPk(
          concrete_design_id
        );

        if (!(material && concreteDesign)) {
          return res.status(404).json({
            message: `${!material ? 'Material' : 'ConcreteDesign'} not found`,
          });
        }
        // eslint-disable-next-line no-await-in-loop
        const materialAlreadyInUse = await _ConcreteDesignMaterial2.default.findOne(
          {
            where: {
              material_id,
              concrete_design_id,
            },
          }
        );

        if (materialAlreadyInUse) {
          return res.status(400).json({
            message: 'Material already in use for this concrete design',
          });
        }
      }

      const response = await _ConcreteDesignMaterial2.default.bulkCreate(
        req.body,
        {
          transaction,
          individualHooks: true,
          returning: ['id'],
        }
      );

      await transaction.commit();

      const concreteDesignMaterial = await Promise.all(
        response.map(({ id }) =>
          _ConcreteDesignMaterial2.default.findByPk(id, {
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
          })
        )
      );

      return res.json(concreteDesignMaterial);
    } catch (error) {
      await transaction.rollback();
      return next(error);
    }
  }

  async index(req, res, next) {
    try {
      const concreteDesingMaterials = await _ConcreteDesignMaterial2.default.findAll();
      return res.json(concreteDesingMaterials);
    } catch (error) {
      return next(error);
    }
  }

  async update(req, res, next) {
    const transaction = await _ConcreteDesignMaterial2.default.sequelize.transaction();
    try {
      const schema = Yup.array().of(
        Yup.object()
          .shape({
            id: Yup.string().required(),
            material_id: Yup.string(),
            quantity_per_m3: Yup.number(),
          })
          .required()
      );

      if (!(await schema.isValid(req.body))) {
        res.status(400).json({ message: 'Validation Error' });
      }

      await Promise.all(
        req.body.map(({ id, material_id, quantity_per_m3 }) =>
          _ConcreteDesignMaterial2.default.update(
            { material_id, quantity_per_m3 },
            { where: { id }, transaction }
          )
        )
      );

      await transaction.commit();

      const concreteDesignMaterial = await Promise.all(
        req.body.map(({ id }) =>
          _ConcreteDesignMaterial2.default.findByPk(id, {
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
          })
        )
      );

      return res.json(concreteDesignMaterial);
    } catch (error) {
      await transaction.rollback();
      return next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ message: 'ConcreteDesignId is empty' });
      }

      const affectedRows = await _ConcreteDesignMaterial2.default.destroy({
        where: { id },
      });

      return res.json(affectedRows);
    } catch (error) {
      return next(error);
    }
  }
}
exports.default = new ConcreteDesignMaterialController();
