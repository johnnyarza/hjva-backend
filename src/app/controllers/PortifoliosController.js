import * as Yup from 'yup';
import Settings from '../../database/models/Settings';
import Portifolio from '../../database/models/Portifolio';
import PortifolioFile from '../../database/models/PortifolioFile';

class PortifoliosController {
  async delete(req, res, next) {
    const transaction = await Portifolio.sequelize.transaction();
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

      const portifolio = await Portifolio.findByPk(id);
      if (!portifolio) {
        await transaction.rollback();
        return res.status(404).json({ message: 'Portifolio no encontrado' });
      }

      const files = await PortifolioFile.findAll({
        where: { portifolio_id: id },
      });

      await Promise.all(files.map((file) => file.destroy({ transaction })));

      const portifolioAffectedRows = await Portifolio.destroy({
        where: { id },
        transaction,
      });

      await transaction.commit();
      return res.json(portifolioAffectedRows);
    } catch (error) {
      await transaction.rollback();
      return next(error);
    }
  }

  async store(req, res, next) {
    const transaction = await Portifolio.sequelize.transaction();
    try {
      const schema = Yup.object().shape({
        title: Yup.string().required(),
        paragraph: Yup.string().required(),
      });

      if (!(await schema.isValid(req.body))) {
        await transaction.rollback();
        return res.status(400).json({ message: 'Validation error' });
      }

      const setting = await Portifolio.create({ ...req.body });

      await transaction.commit();
      return res.json(setting);
    } catch (error) {
      await transaction.rollback();
      return next(error);
    }
  }

  async index(req, res, next) {
    try {
      const portifolios = await Portifolio.findAll({
        include: [
          {
            model: PortifolioFile,
            as: 'file',
          },
        ],
      });
      return res.json(portifolios);
    } catch (error) {
      return next(error);
    }
  }

  async update(req, res, next) {
    const transaction = await Portifolio.sequelize.transaction();
    try {
      const { id } = req.params;
      const { title, paragraph } = req.body;
      const schema = Yup.object().shape({
        id: Yup.string().uuid().required(),
        title: Yup.string(),
        paragraph: Yup.string(),
      });

      if (!(await schema.isValid({ id, title, paragraph }))) {
        await transaction.rollback();
        return res.status(400).json({ message: 'Validation error' });
      }

      const portifolio = await Portifolio.findByPk(id, { transaction });

      if (!portifolio) {
        await transaction.rollback();
        return res.status(404).json({ message: 'Portifolio not found' });
      }

      await portifolio.update(req.body);

      await transaction.commit();
      return res.json(portifolio);
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
        return res.status(400).json({ message: 'QUery is empty' });
      }

      const setting = await Settings.findOne({ where: query });
      return res.json(setting);
    } catch (error) {
      return next(error);
    }
  }
}

export default new PortifoliosController();
