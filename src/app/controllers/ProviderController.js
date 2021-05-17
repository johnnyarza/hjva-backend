import * as Yup from 'yup';
import Provider from '../../database/models/Provider';
import User from '../../database/models/User';

class ProviderController {
  async store(req, res, next) {
    try {
      const schema = Yup.object().shape({
        name: Yup.string().required(),
        email: Yup.string().email().notRequired(),
        address: Yup.string(),
        phone: Yup.string(),
        notes: Yup.string(),
      });

      if (!(await schema.isValid(req.body))) {
        return res.status(400).json({ error: 'Validation error' });
      }

      const provider = await Provider.create(req.body);

      return res.json(provider);
    } catch (error) {
      return next(error);
    }
  }

  async index(req, res, next) {
    try {
      const providers = await Provider.findAll();

      return res.json(providers);
    } catch (error) {
      return next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const schema = Yup.object().shape({
        name: Yup.string().required(),
        email: Yup.string().email(),
        address: Yup.string(),
        phone: Yup.string(),
      });

      if (!id) {
        return res.status(400).json({ error: 'Provider id não informado' });
      }

      if (!(await schema.isValid(req.body))) {
        return res.status(400).json({ error: 'Validation error' });
      }

      await Provider.update(req.body, {
        where: { id },
      });

      const provider = await Provider.findByPk(id);

      if (!provider) {
        return res.status(404).json({ error: 'Provider not found' });
      }

      return res.json(provider);
    } catch (error) {
      return next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const { userId } = req;

      if (!id || !userId) {
        return res
          .status(400)
          .json({ error: `${!id ? 'Client' : 'User'} id não informado` });
      }

      const user = await User.findByPk(userId);

      if (!(user.role === 'admin')) {
        return res
          .status(403)
          .json({ error: `Usuário não tem privilégios suficientes` });
      }

      const affectedRows = await Provider.destroy({ where: { id } });

      return res.json(affectedRows);
    } catch (error) {
      return next(error);
    }
  }
}

export default new ProviderController();
