import * as Yup from 'yup';
import Settings from '../../database/models/Settings';
import File from '../../database/models/SettingFile';

class SettingsController {
  async delete(req, res, next) {
    const transaction = await Settings.sequelize.transaction();
    try {
      const { id } = req.params;
      const schema = Yup.object().shape({
        id: Yup.string().uuid().required(),
      });

      if (!id) {
        await transaction.rollback();
        return res.status(400).json({ message: 'Id vacío' });
      }

      if (!(await schema.isValid(req.params))) {
        await transaction.rollback();
        return res.status(400).json({ message: 'Validation error' });
      }

      const affectedRows = await Settings.destroy({ where: { id } });

      await transaction.commit();
      return res.json(affectedRows);
    } catch (error) {
      await transaction.rollback();
      return next(error);
    }
  }

  async store(req, res, next) {
    const transaction = await Settings.sequelize.transaction();
    try {
      const schema = Yup.object().shape({
        name: Yup.string().required(),
        value: Yup.string().required(),
      });

      if (!(await schema.isValid(req.body))) {
        await transaction.rollback();
        return res.status(400).json({ message: 'Validation error' });
      }

      const exists = await Settings.findOne({ where: { name: req.body.name } });
      if (exists) {
        await transaction.rollback();
        return res.status(403).json({ message: 'Nombre ya existe' });
      }

      const setting = await Settings.create({ ...req.body });

      await transaction.commit();
      return res.json(setting);
    } catch (error) {
      await transaction.rollback();
      return next(error);
    }
  }

  async index(req, res, next) {
    try {
      const settings = await Settings.findAll({
        include: [{ model: File, as: 'file' }],
      });
      return res.json(settings);
    } catch (error) {
      return next(error);
    }
  }

  async update(req, res, next) {
    const transaction = await Settings.sequelize.transaction();
    try {
      const { id } = req.params;
      const { name, value } = req.body;
      const schema = Yup.object().shape({
        id: Yup.string().uuid().required(),
        name: Yup.string().required(),
        value: Yup.string().required(),
      });

      if (!(await schema.isValid({ id, name, value }))) {
        await transaction.rollback();
        return res.status(400).json({ message: 'Validation error' });
      }

      const setting = await Settings.findByPk(id, { transaction });

      if (!setting) {
        await transaction.rollback();
        return res.status(404).json({ message: 'Setting not found' });
      }

      await setting.update(req.body);

      await transaction.commit();
      return res.json(setting);
    } catch (error) {
      await transaction.rollback();
      return next(error);
    }
  }

  async updateByName(req, res, next) {
    const transaction = await Settings.sequelize.transaction();
    try {
      const { name } = req.params;
      const { value } = req.body;

      const schema = Yup.object().shape({
        value: Yup.string().required(),
      });

      if (!(await schema.isValid({ value }))) {
        await transaction.rollback();
        return res.status(400).json({ message: 'Validation error' });
      }

      if (!name) {
        return res.status(400).json({ message: 'Name was not informed' });
      }

      const setting = await Settings.findOne(
        { where: { name }, include: [{ model: File, as: 'file' }] },
        { transaction }
      );

      if (!setting) {
        await transaction.rollback();
        return res.status(404).json({ message: 'Setting not found' });
      }

      await transaction.commit();
      return res.json(setting);
    } catch (error) {
      await transaction.rollback();
      return next(error);
    }
  }

  async find(req, res, next) {
    try {
      const { query } = req;
      const queries = Object.entries(query);

      if (queries.length === 0) {
        return res.status(400).json({ message: 'Query is empty' });
      }

      const setting = await Settings.findOne({
        where: query,
        include: [{ model: File, as: 'file' }],
      });
      return res.json(setting);
    } catch (error) {
      return next(error);
    }
  }
}

export default new SettingsController();
