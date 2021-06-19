"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _yup = require('yup'); var Yup = _interopRequireWildcard(_yup);
var _Client = require('../../database/models/Client'); var _Client2 = _interopRequireDefault(_Client);
var _CompressionTest = require('../../database/models/CompressionTest'); var _CompressionTest2 = _interopRequireDefault(_CompressionTest);
var _ConcreteDesign = require('../../database/models/ConcreteDesign'); var _ConcreteDesign2 = _interopRequireDefault(_ConcreteDesign);
var _ConcreteDesignMaterial = require('../../database/models/ConcreteDesignMaterial'); var _ConcreteDesignMaterial2 = _interopRequireDefault(_ConcreteDesignMaterial);
var _ConcreteSample = require('../../database/models/ConcreteSample'); var _ConcreteSample2 = _interopRequireDefault(_ConcreteSample);
var _Material = require('../../database/models/Material'); var _Material2 = _interopRequireDefault(_Material);

class ConcreteSampleController {
  async store(req, res, next) {
    const transaction = await _ConcreteSample2.default.sequelize.transaction();
    try {
      const schema = Yup.object().shape({
        compressionTestId: Yup.string().required(),
        concreteDesignId: Yup.string().required(),
        concreteSamples: Yup.array().of(
          Yup.object().shape({
            load: Yup.number(),
            weight: Yup.number(),
            height: Yup.number(),
            diameter: Yup.number(),
            slump: Yup.number(),
            notes: Yup.string(),
            sampledAt: Yup.date().required(),
            loadedAt: Yup.date().required(),
          })
        ),
      });

      if (!(await schema.isValid(req.body))) {
        return res.status(400).json({ message: 'Validation error' });
      }
      const { compressionTestId, concreteDesignId } = req.body;

      const concreteSamplesBody = req.body.concreteSamples.map((c) => {
        const {
          load,
          weight,
          height,
          diameter,
          slump,
          notes,
          sampledAt,
          loadedAt,
        } = c;

        return {
          compression_test_id: compressionTestId,
          concrete_design_id: concreteDesignId,
          load,
          weight,
          height,
          diameter,
          slump,
          notes,
          sampledAt,
          loadedAt,
        };
      });

      const rawConcreteSamples = await _ConcreteSample2.default.bulkCreate(
        concreteSamplesBody,
        {
          individualHooks: true,
          transaction,
        }
      );

      await transaction.commit();

      const concreteSamples = await Promise.all(
        rawConcreteSamples.map(({ id }) =>
          _ConcreteSample2.default.findOne({
            where: { id },
            include: [
              {
                model: _CompressionTest2.default,
                as: 'compressionTest',
                attributes: ['id', 'tracker'],
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
                  },
                ],
              },
            ],
            attributes: [
              'id',
              'tracker',
              'load',
              'weight',
              'height',
              'diameter',
              'slump',
              'notes',
              'sampledAt',
              'loadedAt',
              'updatedAt',
            ],
          })
        )
      );

      return res.json(concreteSamples);
    } catch (error) {
      await transaction.rollback();
      return next(error);
    }
  }

  async index(req, res, next) {
    try {
      const { compressionTestId } = req.query;
      const whereOption = compressionTestId
        ? { where: { compression_test_id: compressionTestId } }
        : {};
      const options = {
        ...whereOption,
        order: [['tracker', 'ASC']],
        include: [
          {
            model: _CompressionTest2.default,
            as: 'compressionTest',
            attributes: ['id', 'tracker'],
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
              },
            ],
          },
        ],
        attributes: {
          exclude: ['compression_test_id', 'concrete_design_id'],
          include: ['tracker'],
        },
      };

      const concreteSamples = await _ConcreteSample2.default.findAll(options);

      concreteSamples.forEach((row) => {
        const { days } = row;
        row.days = days;
      });

      return res.json(concreteSamples);
    } catch (error) {
      return next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ message: 'Concrete Sample id empty' });
      }

      const affectedRows = await _ConcreteSample2.default.destroy({ where: { id } });

      return res.json(affectedRows);
    } catch (error) {
      return next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const schema = Yup.object().shape({
        compressionTestId: Yup.string(),
        concreteDesignId: Yup.string(),
        load: Yup.number(),
        weight: Yup.number(),
        height: Yup.number(),
        diameter: Yup.number(),
        slump: Yup.number(),
        notes: Yup.string(),
        sampledAt: Yup.date(),
        loadedAt: Yup.date(),
      });

      if (!(await schema.isValid(req.body))) {
        return res.status(400).json({ message: 'Validation error' });
      }

      if (!id) {
        return res.status(400).json({ message: 'Concrete sample id is empty' });
      }

      const concreteSampleExists = await _ConcreteSample2.default.findByPk(id);

      if (!concreteSampleExists) {
        return res.status(404).json({ message: 'Concrete sample not found' });
      }
      const {
        compressionTestId: compression_test_id,
        concreteDesignId: concrete_design_id,
      } = req.body;

      if (compression_test_id) {
        const compressionTestExists = await _CompressionTest2.default.findByPk(
          compression_test_id
        );
        if (!compressionTestExists) {
          return res
            .status(404)
            .json({ message: 'Compression test not found' });
        }
      }
      if (concrete_design_id) {
        const compressionTestExists = await _ConcreteDesign2.default.findByPk(
          concrete_design_id
        );
        if (!compressionTestExists) {
          return res.status(404).json({ message: 'Concrete Design not found' });
        }
      }

      const {
        load,
        weight,
        height,
        diameter,
        slump,
        notes,
        sampledAt,
        loadedAt,
      } = req.body;

      await _ConcreteSample2.default.update(
        {
          load,
          weight,
          height,
          diameter,
          slump,
          notes,
          sampledAt,
          loadedAt,
          compression_test_id,
          concrete_design_id,
        },
        { where: { id } }
      );
      console.trace(sampledAt);

      const updatedConcreteSample = await _ConcreteSample2.default.findByPk(id, {
        include: [
          {
            model: _CompressionTest2.default,
            as: 'compressionTest',
            attributes: ['id', 'tracker'],
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
              },
            ],
          },
        ],
        attributes: [
          'id',
          'tracker',
          'load',
          'weight',
          'height',
          'diameter',
          'slump',
          'notes',
          'sampledAt',
          'loadedAt',
          'updatedAt',
        ],
      });

      return res.json(updatedConcreteSample);
    } catch (error) {
      return next(error);
    }
  }
}

exports. default = new ConcreteSampleController();
