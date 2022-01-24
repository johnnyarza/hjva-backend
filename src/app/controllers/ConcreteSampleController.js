import * as Yup from 'yup';
import Client from '../../database/models/Client';
import CompressionTest from '../../database/models/CompressionTest';
import ConcreteDesign from '../../database/models/ConcreteDesign';
import ConcreteSample from '../../database/models/ConcreteSample';
import Material from '../../database/models/Material';
import Measure from '../../database/models/Measure';
import Provider from '../../database/models/Provider';
import ConcreteSampleReport from '../reports/ConcreteSampleReport';
import util from '../utils/utils';

class ConcreteSampleController {
  async getLateConcreteSamples(req, res, next) {
    try {
      return res.json({ message: 'ok' });
    } catch (error) {
      return next(error);
    }
  }

  async store(req, res, next) {
    const transaction = await ConcreteSample.sequelize.transaction();
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
        await transaction.rollback();
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

      const rawConcreteSamples = await ConcreteSample.bulkCreate(
        concreteSamplesBody,
        {
          individualHooks: true,
          transaction,
        }
      );

      await transaction.commit();

      const concreteSamples = await Promise.all(
        rawConcreteSamples.map(({ id }) =>
          ConcreteSample.findOne({
            where: { id },
            include: [
              {
                model: CompressionTest,
                as: 'compressionTest',
                attributes: ['id', 'tracker'],
                include: [
                  {
                    model: Client,
                    as: 'client',
                    attributes: ['id', 'name'],
                  },
                  {
                    model: Client,
                    as: 'concreteProvider',
                    attributes: ['id', 'name'],
                  },
                  {
                    model: ConcreteDesign,
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
            model: CompressionTest,
            as: 'compressionTest',
            attributes: ['id', 'tracker'],
            include: [
              {
                model: Client,
                as: 'client',
                attributes: ['id', 'name'],
              },
              {
                model: Client,
                as: 'concreteProvider',
                attributes: ['id', 'name'],
              },
              {
                model: ConcreteDesign,
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

      const concreteSamples = await ConcreteSample.findAll(options);

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
    const transaction = await ConcreteSample.sequelize.transaction();
    try {
      const { id } = req.params;

      if (!id) {
        await transaction.rollback();
        return res.status(400).json({ message: 'Concrete Sample id empty' });
      }

      const affectedRows = await ConcreteSample.destroy({
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

  async update(req, res, next) {
    const transaction = await ConcreteSample.sequelize.transaction();
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
        await transaction.rollback();
        return res.status(400).json({ message: 'Validation error' });
      }

      if (!id) {
        await transaction.rollback();
        return res.status(400).json({ message: 'Concrete sample id is empty' });
      }

      const concreteSampleExists = await ConcreteSample.findByPk(id);

      if (!concreteSampleExists) {
        await transaction.rollback();
        return res.status(404).json({ message: 'Concrete sample not found' });
      }
      const {
        compressionTestId: compression_test_id,
        concreteDesignId: concrete_design_id,
      } = req.body;

      if (compression_test_id) {
        const compressionTestExists = await CompressionTest.findByPk(
          compression_test_id
        );
        if (!compressionTestExists) {
          await transaction.rollback();
          return res
            .status(404)
            .json({ message: 'Compression test not found' });
        }
      }
      if (concrete_design_id) {
        const compressionTestExists = await ConcreteDesign.findByPk(
          concrete_design_id
        );
        if (!compressionTestExists) {
          await transaction.rollback();
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

      await ConcreteSample.update(
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
        { where: { id }, transaction }
      );

      const updatedConcreteSample = await ConcreteSample.findByPk(id, {
        transaction,
        include: [
          {
            model: CompressionTest,
            as: 'compressionTest',
            attributes: ['id', 'tracker'],
            include: [
              {
                model: Client,
                as: 'client',
                attributes: ['id', 'name'],
              },
              {
                model: Client,
                as: 'concreteProvider',
                attributes: ['id', 'name'],
              },
              {
                model: ConcreteDesign,
                as: 'concreteDesign',
                attributes: ['id', 'name', 'slump', 'notes'],
              },
            ],
          },
        ],
        attributes: {
          exclude: [
            'createdAt',
            'updatedAt',
            'compression_test_id',
            'concrete_design_id',
          ],
          include: ['tracker'],
        },
      });

      await transaction.commit();
      return res.json(updatedConcreteSample);
    } catch (error) {
      await transaction.rollback();
      return next(error);
    }
  }

  async getReport(req, res, next) {
    try {
      const whereParams = util.queryParams(req.query);
      const locale = req.query?.locale ? req.query.locale : '';
      const printConcreteDesign = req.query?.printConcreteDesign === 'true';
      const { compressionTest: compressionTestId } = req.query;

      if (!compressionTestId) {
        res.status(400).json({ message: 'CompressionTestId is null' });
      }

      const compressionTest = await CompressionTest.findByPk(
        compressionTestId,
        {
          attributes: { include: ['tracker'] },
          include: [
            { model: Client, as: 'client', attributes: ['id', 'name'] },
            {
              model: Client,
              as: 'concreteProvider',
              attributes: ['id', 'name'],
            },
            {
              model: ConcreteDesign,
              as: 'concreteDesign',
              attributes: { exclude: ['createdAt', 'updatedAt'] },
              include: [
                {
                  model: Material,
                  as: 'materials',
                  attributes: ['id', 'name'],
                  include: [
                    {
                      model: Measure,
                      as: 'measurement',
                      attributes: ['id', 'abbreviation'],
                    },
                    {
                      model: Provider,
                      as: 'provider',
                      attributes: ['id', 'name'],
                    },
                  ],
                },
              ],
            },
          ],
        }
      );

      const data = await ConcreteSample.findAll({
        attributes: { include: ['tracker'] },
        where: { ...whereParams },
        include: [
          {
            model: CompressionTest,
            as: 'compressionTest',
          },
        ],
      });
      // return res.json(data);
      // return res.json(compressionTest);

      return ConcreteSampleReport.createPDF(
        data,
        compressionTest,
        { locale, printConcreteDesign },
        (result) => res.end(result)
      );
    } catch (error) {
      return next(error);
    }
  }
}

export default new ConcreteSampleController();
