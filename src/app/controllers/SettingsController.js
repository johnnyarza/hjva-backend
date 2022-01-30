import * as Yup from 'yup';
import Settings from '../../database/models/Settings';

class SettingsController {
  async store(req, res, next) {
    const transaction = await Settings.sequelize.transaction();
    try {
      const schema = Yup.object().shape({
        name: Yup.string().required(),
        value: Yup.string().required(),
      });

      if (!(await schema.isValid(req.body))) {
        await transaction.rollback();
        return res.status(400).json({ error: 'Validation error' });
      }

      const setting = await Settings.create({ ...req.body });

      return res.json(setting);
    } catch (error) {
      await transaction.rollback();
      return next(error);
    }
  }

  async index(req, res, next) {
    try {
      const settings = await Settings.findAll();
      return res.json(settings);
    } catch (error) {
      return next(error);
    }
  }

  async update(req, res, next) {
    console.log('update');
  }

  async delete(req, res, next) {
    console.log('del');
  }
}

export default new SettingsController();
