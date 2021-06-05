import * as Yup from 'yup';
import Client from '../../database/models/Client';
import CompressionTest from '../../database/models/CompressionTest';
import ConcreteDesign from '../../database/models/ConcreteDesign';
import ConcreteDesignMaterial from '../../database/models/ConcreteDesignMaterial';
import Material from '../../database/models/Material';

class CompressionTestController {
  async store(req, res, next) {
    const transaction = await CompressionTest.sequelize.transaction();
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

      const concreteDesignExists = await ConcreteDesign.findByPk(
        concrete_design_id
      );

      if (!concreteDesignExists) {
        return res.status(404).json({ message: 'Concrete Design not found' });
      }

      const clientExists = await Client.findByPk(client_id);
      const concreteProviderExists = await Client.findByPk(
        concrete_provider_id
      );

      if (!clientExists || !concreteProviderExists) {
        return res.status(404).json({ message: 'Client not found' });
      }

      const { id } = await CompressionTest.create(
        {
          concrete_design_id,
          client_id,
          concrete_provider_id,
          notes,
        },
        { transaction }
      );
      await transaction.commit();
      const compressionTest = await CompressionTest.findByPk(id, {
        attributes: ['id', 'tracker', 'notes', 'updatedAt'],
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
            include: [
              {
                model: ConcreteDesignMaterial,
                as: 'concreteDesignMaterial',
                attributes: ['quantity_per_m3'],
                include: [
                  {
                    model: Material,
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
      const compressionTests = await CompressionTest.findAll({
        attributes: ['id', 'notes', 'tracker', 'updatedAt'],
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
            include: [
              {
                model: ConcreteDesignMaterial,
                as: 'concreteDesignMaterial',
                attributes: ['quantity_per_m3'],
                include: [
                  {
                    model: Material,
                    as: 'material',
                    attributes: ['id', 'name'],
                  },
                ],
              },
            ],
          },
        ],
      });
      return res.json(compressionTests);
    } catch (error) {
      return next(error);
    }
  }

  async update(req, res, next) {
    const transaction = await CompressionTest.sequelize.transaction();
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
        const concreteDesignExists = await ConcreteDesign.findByPk(
          concrete_design_id
        );

        if (!concreteDesignExists) {
          return res.status(404).json({ message: 'Concrete Design not found' });
        }
      }

      if (client_id) {
        const clientExists = await Client.findByPk(client_id);

        if (!clientExists) {
          return res.status(404).json({ message: 'Client not found' });
        }
      }
      if (concrete_provider_id) {
        const providerExists = await Client.findByPk(concrete_provider_id);

        if (!providerExists) {
          return res
            .status(404)
            .json({ message: 'Concrete Provider not found' });
        }
      }

      await CompressionTest.update(
        {
          concrete_design_id,
          client_id,
          notes,
        },
        { where: { id }, transaction }
      );

      await transaction.commit();

      const compressionTest = await CompressionTest.findByPk(id, {
        attributes: ['id', 'notes', 'updatedAt'],
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
            include: [
              {
                model: ConcreteDesignMaterial,
                as: 'concreteDesignMaterial',
                attributes: ['quantity_per_m3'],
                include: [
                  {
                    model: Material,
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

  async delete(req, res, next) {
    const transaction = await CompressionTest.sequelize.transaction();
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: 'Concrete Design id is empty' });
      }
      const affectedRows = await CompressionTest.destroy({
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

export default new CompressionTestController();
