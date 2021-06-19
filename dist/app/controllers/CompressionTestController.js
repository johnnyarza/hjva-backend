"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _sequelize = require('sequelize');
var _yup = require('yup'); var Yup = _interopRequireWildcard(_yup);
var _datefns = require('date-fns');

var _Client = require('../../database/models/Client'); var _Client2 = _interopRequireDefault(_Client);
var _CompressionTest = require('../../database/models/CompressionTest'); var _CompressionTest2 = _interopRequireDefault(_CompressionTest);
var _ConcreteDesign = require('../../database/models/ConcreteDesign'); var _ConcreteDesign2 = _interopRequireDefault(_ConcreteDesign);
var _ConcreteDesignMaterial = require('../../database/models/ConcreteDesignMaterial'); var _ConcreteDesignMaterial2 = _interopRequireDefault(_ConcreteDesignMaterial);
var _ConcreteSample = require('../../database/models/ConcreteSample'); var _ConcreteSample2 = _interopRequireDefault(_ConcreteSample);
var _Material = require('../../database/models/Material'); var _Material2 = _interopRequireDefault(_Material);

class CompressionTestController {
  async store(req, res, next) {
    const transaction = await _CompressionTest2.default.sequelize.transaction();
    try {
      const schema = Yup.object().shape({
        concreteDesignId: Yup.string().required(),
        clientId: Yup.string().required(),
        concreteProviderId: Yup.string().required(),
        notes: Yup.string(),
      });

      if (!(await schema.isValid(req.body))) {
        return res.status(400).json({ message: 'Validation error' });
      }
      const {
        concreteDesignId: concrete_design_id,
        clientId: client_id,
        concreteProviderId: concrete_provider_id,

        notes,
      } = req.body;

      const concreteDesignExists = await _ConcreteDesign2.default.findByPk(
        concrete_design_id
      );

      if (!concreteDesignExists) {
        return res.status(404).json({ message: 'Concrete Design not found' });
      }

      const clientExists = await _Client2.default.findByPk(client_id);
      const concreteProviderExists = await _Client2.default.findByPk(
        concrete_provider_id
      );

      if (!clientExists || !concreteProviderExists) {
        return res.status(404).json({ message: 'Client not found' });
      }

      const { id } = await _CompressionTest2.default.create(
        {
          concrete_design_id,
          client_id,
          concrete_provider_id,
          notes,
        },
        { transaction }
      );
      await transaction.commit();
      const compressionTest = await _CompressionTest2.default.findByPk(id, {
        attributes: ['id', 'tracker', 'notes', 'updatedAt'],
        include: [
          {
            model: _Client2.default,
            as: 'client',
            attributes: ['id', 'name'],
          },
          {
            model: _Client2.default,
            as: 'concreteProvider',
            attributes: ['id', 'name'],
          },
          {
            model: _ConcreteDesign2.default,
            as: 'concreteDesign',
            attributes: ['id', 'name', 'slump', 'notes'],
            include: [
              {
                model: _ConcreteDesignMaterial2.default,
                as: 'concreteDesignMaterial',
                attributes: ['quantity_per_m3'],
                include: [
                  {
                    model: _Material2.default,
                    as: 'material',
                    attributes: ['id', 'name'],
                  },
                ],
              },
            ],
          },
        ],
      });
      return res.json(compressionTest);
    } catch (error) {
      await transaction.rollback();
      return next(error);
    }
  }

  async index(req, res, next) {
    try {
      const { locale } = req.headers || 'pt-BR';
      const compressionTests = await _CompressionTest2.default.findAll({
        attributes: ['id', 'notes', 'tracker', 'updatedAt'],
        include: [
          {
            model: _Client2.default,
            as: 'client',
            attributes: ['id', 'name'],
          },
          {
            model: _Client2.default,
            as: 'concreteProvider',
            attributes: ['id', 'name'],
          },
          {
            model: _ConcreteDesign2.default,
            as: 'concreteDesign',
            attributes: ['id', 'name', 'slump', 'notes'],
            include: [
              {
                model: _ConcreteDesignMaterial2.default,
                as: 'concreteDesignMaterial',
                attributes: ['quantity_per_m3'],
                include: [
                  {
                    model: _Material2.default,
                    as: 'material',
                    attributes: ['id', 'name'],
                  },
                ],
              },
            ],
          },
        ],
      });

      const result = await Promise.all(
        compressionTests.map(async (compressionTest) => {
          const hasWarning = await _ConcreteSample2.default.findOne({
            where: {
              compression_test_id: compressionTest.id,
              load: 0,
              loadedAt: {
                [_sequelize.Op.lt]: _datefns.startOfDay.call(void 0, new Date()),
              },
            },
          });

          compressionTest.hasWarning = !!hasWarning;

          return compressionTest;
        })
      );
      return res.json(result);
    } catch (error) {
      return next(error);
    }
  }

  async update(req, res, next) {
    const transaction = await _CompressionTest2.default.sequelize.transaction();
    try {
      const { id } = req.params;
      const schema = Yup.object().shape({
        concreteDesignId: Yup.string(),
        clientId: Yup.string(),
        concreteProviderId: Yup.string(),
        notes: Yup.string(),
      });

      if (!(await schema.isValid(req.body))) {
        return res.status(400).json({ message: 'Validation error' });
      }

      if (!id) {
        return res.status(400).json({ message: 'Concrete Design Id is empty' });
      }

      const {
        concreteDesignId: concrete_design_id,
        clientId: client_id,
        concreteProviderId: concrete_provider_id,
        notes,
      } = req.body;

      if (concrete_design_id) {
        const concreteDesignExists = await _ConcreteDesign2.default.findByPk(
          concrete_design_id
        );

        if (!concreteDesignExists) {
          return res.status(404).json({ message: 'Concrete Design not found' });
        }
      }

      if (client_id) {
        const clientExists = await _Client2.default.findByPk(client_id);

        if (!clientExists) {
          return res.status(404).json({ message: 'Client not found' });
        }
      }
      if (concrete_provider_id) {
        const providerExists = await _Client2.default.findByPk(concrete_provider_id);

        if (!providerExists) {
          return res
            .status(404)
            .json({ message: 'Concrete Provider not found' });
        }
      }

      await _CompressionTest2.default.update(
        {
          concrete_design_id,
          client_id,
          notes,
        },
        { where: { id }, transaction }
      );

      await transaction.commit();

      const compressionTest = await _CompressionTest2.default.findByPk(id, {
        attributes: ['id', 'tracker', 'notes', 'updatedAt'],
        include: [
          {
            model: _Client2.default,
            as: 'client',
            attributes: ['id', 'name'],
          },
          {
            model: _Client2.default,
            as: 'concreteProvider',
            attributes: ['id', 'name'],
          },
          {
            model: _ConcreteDesign2.default,
            as: 'concreteDesign',
            attributes: ['id', 'name', 'slump', 'notes'],
            include: [
              {
                model: _ConcreteDesignMaterial2.default,
                as: 'concreteDesignMaterial',
                attributes: ['quantity_per_m3'],
                include: [
                  {
                    model: _Material2.default,
                    as: 'material',
                    attributes: ['id', 'name'],
                  },
                ],
              },
            ],
          },
        ],
      });

      if (compressionTest) {
        const hasWarning = await _ConcreteSample2.default.findOne({
          where: {
            compression_test_id: compressionTest.id,
            load: 0,
            loadedAt: {
              [_sequelize.Op.lt]: _datefns.startOfDay.call(void 0, new Date()),
            },
          },
        });
        compressionTest.hasWarning = !!hasWarning;
      }

      return res.json(compressionTest);
    } catch (error) {
      await transaction.rollback();
      return next(error);
    }
  }

  async delete(req, res, next) {
    const transaction = await _CompressionTest2.default.sequelize.transaction();
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: 'Concrete Design id is empty' });
      }
      const affectedRows = await _CompressionTest2.default.destroy({
        where: { id },
        transaction,
      });
      await transaction.commit();
      return res.json(affectedRows);
    } catch (error) {
      await transaction.rollback();
      return next(error);
    }
  }
}

exports. default = new CompressionTestController();
