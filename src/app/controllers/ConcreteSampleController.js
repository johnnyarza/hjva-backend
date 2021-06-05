import * as Yup from 'yup';
import Client from '../../database/models/Client';
import CompressionTest from '../../database/models/CompressionTest';
import ConcreteDesign from '../../database/models/ConcreteDesign';
import ConcreteDesignMaterial from '../../database/models/ConcreteDesignMaterial';
import ConcreteSample from '../../database/models/ConcreteSample';
import Material from '../../database/models/Material';

class ConcreteSampleController {
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
        order: [['sampled_at', 'ASC']],
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
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ message: 'Concrete Sample id empty' });
      }

      const affectedRows = await ConcreteSample.destroy({ where: { id } });

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

      const concreteSampleExists = await ConcreteSample.findByPk(id);
      console.log(concreteSampleExists);

      if (!concreteSampleExists) {
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
        sampledAt: sampled_at,
        loadedAt: loaded_at,
      } = req.body;

      await ConcreteSample.update(
        {
          load,
          weight,
          height,
          diameter,
          slump,
          notes,
          sampled_at,
          loaded_at,
          compression_test_id,
          concrete_design_id,
        },
        { where: { id } }
      );

      const updatedConcreteSample = await ConcreteSample.findByPk(id, {
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
          'sampled_at',
          'loaded_at',
          'updatedAt',
        ],
      });

      return res.json(updatedConcreteSample);
    } catch (error) {
      return next(error);
    }
  }
}

export default new ConcreteSampleController();
