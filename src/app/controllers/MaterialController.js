import * as Yup from 'yup';
import Material from '../../database/models/Material';
import Provider from '../../database/models/Provider';
import User from '../../database/models/User';
import Category from '../../database/models/Category';
import Measure from '../../database/models/Measure';
import File from '../../database/models/MaterialFile';

const defaultFindParams = {
  attributes: [
    'id',
    'name',
    'notes',
    'stockQty',
    'toSell',
    'created_at',
    'updated_at',
  ],
  include: [
    {
      model: Provider,
      as: 'provider',
      attributes: ['id', 'name', 'email', 'address', 'phone', 'notes'],
    },
    {
      model: Category,
      as: 'category',
      attributes: ['id', 'name'],
    },
    {
      model: Measure,
      as: 'measurement',
      attributes: ['id', 'abbreviation'],
    },
    {
      model: File,
      as: 'file',
    },
  ],
};

class MaterialController {
  async store(req, res, next) {
    try {
      const schema = Yup.object().shape({
        name: Yup.string().required(),
        categoryId: Yup.string().required(),
        providerId: Yup.string().required(),
        measurementId: Yup.string().required(),
        notes: Yup.string(),
        toSell: Yup.boolean(),
      });

      if (!(await schema.isValid(req.body))) {
        return res.status(400).json({ message: 'Erro de validação' });
      }

      const provider = await Provider.findByPk(req.body.providerId);
      const category = await Category.findByPk(req.body.categoryId);
      const measurement = await Measure.findByPk(req.body.measurementId);

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
        toSell,
      } = req.body;

      let material = await Material.create({
        name,
        provider_id,
        category_id,
        measurement_id,
        notes,
        toSell,
      });

      material = await Material.findByPk(material.id, {
        attributes: [
          'id',
          'name',
          'notes',
          'stockQty',
          'created_at',
          'updated_at',
          'toSell',
        ],
        include: [
          {
            model: Provider,
            as: 'provider',
          },
          {
            model: Category,
            as: 'category',
          },
          {
            model: Measure,
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
      const materials = await Material.findAll(defaultFindParams);
      return res.json(materials);
    } catch (error) {
      return next(error);
    }
  }

  async findAllToSellMaterials(req, res, next) {
    try {
      const materials = await Material.findAll({
        where: { toSell: true },
        attributes: [
          'id',
          'name',
          'notes',
          'stockQty',
          'toSell',
          'created_at',
          'updated_at',
        ],
        include: [
          {
            model: Provider,
            as: 'provider',
            attributes: ['id', 'name', 'email', 'address', 'phone', 'notes'],
          },
          {
            model: Category,
            as: 'category',
            attributes: ['id', 'name'],
          },
          {
            model: Measure,
            as: 'measurement',
            attributes: ['id', 'abbreviation'],
          },
          {
            model: File,
            as: 'file',
          },
        ],
      });
      return res.json(materials);
    } catch (error) {
      return next(error);
    }
  }

  async update(req, res, next) {
    const transaction = await Material.sequelize.transaction();
    try {
      const { id } = req.params;
      const { userId: requestingId } = req;
      const requestingUser = await User.findByPk(requestingId);

      const schema = Yup.object().shape({
        name: Yup.string(),
        categoryId: Yup.string(),
        providerId: Yup.string(),
        notes: Yup.string(),
        measurementId: Yup.string(),
        toSell: Yup.boolean(),
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
        const provider = await Provider.findByPk(req.body.providerId);
        if (!provider) {
          return res.status(404).json({ message: 'Provider not found' });
        }
        req.body.provider_id = provider_id;
      }

      if (category_id) {
        const category = await Category.findByPk(req.body.categoryId);
        if (!category) {
          return res.status(404).json({ message: 'Category not found' });
        }
        req.body.category_id = category_id;
      }

      if (measurement_id) {
        const measure = await Measure.findByPk(req.body.measurementId);
        if (!measure) {
          return res.status(404).json({ message: 'Measure not found' });
        }
        req.body.measurement_id = measurement_id;
      }

      await Material.update(req.body, { where: { id }, transaction });

      const material = await Material.findByPk(id, {
        transaction,
        attributes: [
          'id',
          'name',
          'notes',
          'stockQty',
          'created_at',
          'updated_at',
          'toSell',
        ],
        include: [
          {
            model: Provider,
            as: 'provider',
          },
          {
            model: Category,
            as: 'category',
          },
          {
            model: Measure,
            as: 'measurement',
          },
          {
            model: File,
            as: 'file',
          },
        ],
      });
      await transaction.commit();

      return res.json(material);
    } catch (error) {
      await transaction.rollback();
      return next(error);
    }
  }

  async findById(req, res, next) {
    const transaction = await Material.sequelize.transaction();
    try {
      const { id } = req.params;
      const { userId: requestingId } = req;
      const requestingUser = await User.findByPk(requestingId);

      if (!id) {
        return res.status(400).json({ message: 'Product id is empty' });
      }

      // if (!requestingUser) {
      //   return res.status(404).json({ message: 'Requesting user not found' });
      // }

      // const { role } = requestingUser;

      // if (!(role === 'admin' || role === 'escritorio')) {
      //   return res
      //     .status(403)
      //     .json({ message: 'User does not have enough privileges' });
      // }

      const material = await Material.findByPk(id, {
        transaction,
        ...defaultFindParams,
      });
      await transaction.commit();

      return res.json(material);
    } catch (error) {
      await transaction.rollback();
      return next(error);
    }
  }

  async delete(req, res, next) {
    const transaction = await Material.sequelize.transaction();
    try {
      const { id } = req.params;
      const { userId: requestingId } = req;

      if (!id) {
        return res.status(400).json({ message: 'Product id is empty' });
      }
      if (!requestingId) {
        return res.status(400).json({ message: 'Requesting user id is empty' });
      }

      const requestingUser = await User.findByPk(requestingId);

      if (!requestingUser) {
        return res.status(404).json({ message: 'Requesting user not found' });
      }

      const { role } = requestingUser;

      if (!(role === 'admin' || role === 'escritorio')) {
        return res
          .status(403)
          .json({ message: 'User does not have enough privileges' });
      }

      const files = await File.findAll({ where: { material_id: id } });
      await Promise.all(files.map((file) => file.destroy({ transaction })));

      const affectedRows = await Material.destroy({
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

export default new MaterialController();
