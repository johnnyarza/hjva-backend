import * as Yup from 'yup';
import Material from '../../database/models/Material';
import Provider from '../../database/models/Provider';
import User from '../../database/models/User';

class MaterialController {
  async store(req, res, next) {
    try {
      const schema = Yup.object().shape({
        name: Yup.string().required(),
        providerId: Yup.string().required(),
        notes: Yup.string(),
      });

      if (!(await schema.isValid(req.body))) {
        return res.status(400).json({ error: 'Erro de validação' });
      }

      const provider = await Provider.findByPk(req.body.providerId);

      if (!provider) {
        return res.status(404).json({ error: 'Provider not found' });
      }
      const { name, providerId: provider_id, notes } = req.body;

      const material = await Material.create({
        name,
        provider_id,
        notes,
      });

      return res.json(material);
    } catch (error) {
      return next(error);
    }
  }

  async index(req, res, next) {
    try {
      const materials = await Material.findAll({
        attributes: ['id', 'name', 'notes', 'created_at', 'updated_at'],
        include: {
          model: Provider,
          as: 'provider',
        },
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
      const requestingUser = await User.findByPk(requestingId);

      const schema = Yup.object().shape({
        name: Yup.string(),
        providerId: Yup.string(),
        notes: Yup.string(),
      });

      if (!id) {
        return res.status(400).json({ error: 'Product id is empty' });
      }

      if (!(await schema.isValid(req.body))) {
        return res.status(400).json({ error: 'Validation error' });
      }

      if (!requestingUser) {
        return res.status(404).json({ error: 'Requesting user not found' });
      }

      const { role } = requestingUser;

      if (!(role === 'admin' || role === 'escritorio')) {
        return res
          .status(403)
          .json({ error: 'User does not have enough privileges' });
      }

      const { providerId: provider_id } = req.body;

      if (provider_id) {
        const provider = await Provider.findByPk(req.body.providerId);
        if (!provider) {
          return res.status(404).json({ error: 'Provider not found' });
        }
        req.body.provider_id = provider_id;
      }

      await Material.update(req.body, { where: { id } });

      const material = await Material.findByPk(id, {
        attributes: ['id', 'name', 'notes', 'created_at', 'updated_at'],
        include: {
          model: Provider,
          as: 'provider',
        },
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
        return res.status(400).json({ error: 'Product id is empty' });
      }
      if (!requestingId) {
        return res.status(400).json({ error: 'Requesting user id is empty' });
      }

      const requestingUser = await User.findByPk(requestingId);

      if (!requestingUser) {
        return res.status(404).json({ error: 'Requesting user not found' });
      }

      const { role } = requestingUser;

      if (!(role === 'admin' || role === 'escritorio')) {
        return res
          .status(403)
          .json({ error: 'User does not have enough privileges' });
      }

      const affectedRows = await Material.destroy({ where: { id } });

      return res.json(affectedRows);
    } catch (error) {
      return next(error);
    }
  }
}

export default new MaterialController();
