import * as Yup from 'yup';
import Client from '../../database/models/Client';
import User from '../../database/models/User';
import ClientReport from '../reports/ClientReport';
import util from '../utils/utils';

class ClientController {
  async store(req, res, next) {
    try {
      const schema = Yup.object().shape({
        name: Yup.string().required(),
        email: Yup.string().email(),
        address: Yup.string(),
        phone: Yup.string(),
        notes: Yup.string(),
      });

      if (!(await schema.isValid(req.body))) {
        return res.status(400).json({ error: 'Validation error' });
      }

      const client = await Client.create(req.body);

      return res.json(client);
    } catch (error) {
      return next(error);
    }
  }

  async index(req, res, next) {
    try {
      const clients = await Client.findAll();
      return res.json(clients);
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
        return res.status(400).json({ error: 'Client id não informado' });
      }

      if (!(await schema.isValid(req.body))) {
        return res.status(400).json({ error: 'Validation error' });
      }

      await Client.update(req.body, {
        where: { id },
      });

      const client = await Client.findByPk(id);

      return res.json(client);
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

      const affectedRows = await Client.destroy({ where: { id } });

      return res.json(affectedRows);
    } catch (error) {
      return next(error);
    }
  }

  async getReport(req, res, next) {
    try {
      const whereParams = util.queryParams(req.query);
      const cats = await Client.findAll({
        where: { ...whereParams },
        attributes: ['name', 'email', 'address', 'phone', 'updated_at'],
      });
      return ClientReport.createPDF(cats, '', (result) => res.end(result));
    } catch (error) {
      return next(error);
    }
  }
}

export default new ClientController();
