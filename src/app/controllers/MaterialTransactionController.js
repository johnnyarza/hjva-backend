import * as Yup from 'yup';
import Category from '../../database/models/Category';
import Client from '../../database/models/Client';
import Material from '../../database/models/Material';
import MaterialTransaction from '../../database/models/MaterialTransaction';
import Measure from '../../database/models/Measure';
import Provider from '../../database/models/Provider';
import User from '../../database/models/User';

const checkIfObjectsExists = async (
  materialId = '',
  clientId = '',
  providerId = ''
) => {
  if (!(materialId || clientId || providerId)) return { exists: false };

  const res = { exists: true };
  if (materialId) {
    const material = await Material.findByPk(materialId);
    if (!material) return { model: 'material', exists: false };
  }
  if (clientId) {
    const client = await Client.findByPk(clientId);
    if (!client) return { model: 'client', exists: false };
  }
  if (providerId) {
    const provider = await Provider.findByPk(providerId);
    if (!provider) return { model: 'provider', exists: false };
  }
  return res;
};

const findByPkDefaultOptions = {
  order: [['created_at', 'DESC']],
  attributes: {
    exclude: [
      'materialId',
      'material_id',
      'clientId',
      'client_id',
      'providerId',
      'provider_id',
      'previous_qty',
    ],
  },
  include: [
    {
      model: Client,
      as: 'client',
      attributes: ['id', 'name'],
    },
    {
      model: Provider,
      as: 'provider',
      attributes: ['id', 'name'],
    },
    {
      model: Material,
      as: 'material',
      attributes: ['id', 'name', 'stock_qty'],
      include: [
        {
          model: Measure,
          as: 'measurement',
          attributes: ['abbreviation'],
        },
        {
          model: Category,
          as: 'category',
          attributes: ['name'],
        },
      ],
    },
  ],
};

class MaterialTransactionController {
  async store(req, res, next) {
    const transaction = await MaterialTransaction.sequelize.transaction();
    try {
      const { materialId, clientId, providerId } = req.body;
      const schema = Yup.object().shape(
        {
          entry: Yup.number(),
          notes: Yup.string(),
          materialId: Yup.string().required(),
          clientId: Yup.string().when(
            'providerId',
            (providerIdField, field) => {
              if (!providerIdField) {
                return field.required();
              }
              return field;
            }
          ),
          providerId: Yup.string().when('clientId', (clientIdField, field) => {
            if (!clientIdField) {
              return field.required();
            }
            return field;
          }),
        },
        [['clientId', 'providerId']]
      );

      if (!(await schema.isValid(req.body))) {
        return res.status(400).json({ message: 'Validation Error' });
      }

      if (providerId && clientId) {
        return res
          .status(400)
          .json({ message: 'Provide only ClientId or ProviderId' });
      }

      const { exists, model } = await checkIfObjectsExists(
        '',
        clientId,
        providerId
      );

      if (!exists) {
        return res.status(404).json({ message: `${model} does not exist` });
      }

      const material = await Material.findByPk(materialId);

      if (!material) {
        return res.status(404).json({ message: `Material does not exist` });
      }

      const { stockQty: previousQty } = material;

      const { id } = await MaterialTransaction.create(
        {
          previousQty,
          ...req.body,
        },
        transaction
      );

      const sum = await MaterialTransaction.sum('entry', {
        where: { material_id: materialId },
      });

      await Material.update(
        { stockQty: sum },
        { where: { id: materialId }, transaction }
      );
      await transaction.commit();
      const materialTransaction = await MaterialTransaction.findByPk(
        id,
        findByPkDefaultOptions
      );

      return res.json(materialTransaction);
    } catch (error) {
      await transaction.rollback();
      return next(error);
    }
  }

  async delete(req, res, next) {
    const transaction = await MaterialTransaction.sequelize.transaction();
    try {
      const { id } = req.params;
      const { userId } = req;

      if (!id) {
        return res.status(400).json({ message: 'Id is empty' });
      }
      if (!userId) {
        return res.status(400).json({ message: 'UserId is empty' });
      }
      const userExists = await User.findByPk(userId);

      if (!userExists) {
        return res.status(404).json({ message: 'User not found' });
      }
      const { role: userRole } = userExists;

      if (userRole !== 'admin') {
        return res
          .status(403)
          .json({ message: 'user does not have enough privileges' });
      }

      const materialTransaction = await MaterialTransaction.findByPk(
        id,
        findByPkDefaultOptions
      );

      const { material } = materialTransaction;
      const { id: material_id } = material;

      const affectedRows = await MaterialTransaction.destroy({
        where: { id },
        transaction,
      });

      const sum = await MaterialTransaction.sum('entry', {
        where: { material_id },
        transaction,
      });

      await Material.update(
        { stockQty: sum },
        { where: { id: material_id }, transaction }
      );

      await transaction.commit();
      return res.json(affectedRows);
    } catch (error) {
      await transaction.rollback();
      return next(error);
    }
  }

  async index(req, res, next) {
    try {
      const matTrans = await MaterialTransaction.findAll(
        findByPkDefaultOptions
      );
      return res.json(matTrans);
    } catch (error) {
      return next(error);
    }
  }

  async update(req, res, next) {
    const transaction = await MaterialTransaction.sequelize.transaction();
    try {
      const { providerId, clientId, materialId } = req.body;
      const { id } = req.params;
      const schema = Yup.object().shape({
        entry: Yup.number(),
        notes: Yup.string(),
        materialId: Yup.string().required(),
        clientId: Yup.string(),
        providerId: Yup.string(),
      });

      if (!id) {
        return res.status(400).json({ message: 'Id is empty' });
      }

      if (!(await schema.isValid(req.body))) {
        return res.status(400).json({ message: 'Validation error' });
      }

      if (providerId && clientId) {
        return res
          .status(400)
          .json({ message: 'Provide only ClientId or ProviderId' });
      }

      if (providerId && !clientId) {
        req.body.clientId = null;
      }
      if (clientId && !providerId) {
        req.body.providerId = null;
      }

      const { model, exists } = await checkIfObjectsExists(
        '',
        clientId,
        providerId
      );

      if (!exists) {
        return res.status(404).json({ message: `${model} does not exist` });
      }

      const material = await Material.findByPk(materialId);
      if (!material) {
        return res.status(404).json({ message: `Material does not exist` });
      }

      const materialTransactionExists = await MaterialTransaction.findByPk(id);

      if (!materialTransactionExists) {
        return res
          .status(404)
          .json({ message: `Material Transaction does not exist` });
      }

      const { material_id: currentMaterialId } = materialTransactionExists;

      if (currentMaterialId !== materialId) {
        return res
          .status(403)
          .json({ message: `Informed Material is not the same` });
      }

      await MaterialTransaction.update(req.body, {
        where: { id },
        transaction,
      });

      if (req.body.entry) {
        const sum = await MaterialTransaction.sum('entry', {
          where: { material_id: materialId },
          transaction,
        });
        await Material.update(
          { stockQty: sum },
          { where: { id: materialId }, transaction }
        );
      }
      await transaction.commit();

      const materialTransaction = await MaterialTransaction.findByPk(
        id,
        findByPkDefaultOptions
      );

      return res.json(materialTransaction);
    } catch (error) {
      await transaction.rollback();
      return next(error);
    }
  }
}

export default new MaterialTransactionController();
