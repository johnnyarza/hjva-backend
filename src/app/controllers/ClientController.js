import * as Yup from 'yup';
import Client from '../../database/models/Client';

class ClientController {
  async store(req, res, next) {
    try {
      const schema = Yup.object().shape({
        name: Yup.string().required(),
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

  async update(req, res) {
    return res.json('Ok');
  }

  async delete(req, res) {
    return res.json('Ok');
  }
}

export default new ClientController();
