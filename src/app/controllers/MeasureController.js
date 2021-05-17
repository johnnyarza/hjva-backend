import * as Yup from 'yup';
import Measure from '../../database/models/Measure';
import User from '../../database/models/User';

class MeasureController {
  async store(req, res, next) {
    const schema = Yup.object().shape({
      abbreviation: Yup.string().required().max(3),
      notes: Yup.string(),
    });
    try {
      if (!(await schema.isValid(req.body))) {
        return res.status(400).json({ message: 'validation error' });
      }
      const measure = await Measure.create(req.body);

      return res.json(measure);
    } catch (error) {
      return next(error);
    }
  }

  async index(req, res, next) {
    try {
      const measurements = await Measure.findAll();
      return res.json(measurements);
    } catch (error) {
      return next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const schema = Yup.object().shape({
        abbreviation: Yup.string().required().max(3),
        notes: Yup.string(),
      });

      if (!(await schema.isValid(req.body))) {
        return res.status(400).json({ message: 'updated validation error' });
      }
      if (!id) {
        return res.status(400).json({ message: 'Invalid measure id' });
      }

      if (!(await Measure.findByPk(id))) {
        return res.status(404).json({ message: 'Measure not found' });
      }

      await Measure.update(req.body, {
        where: { id },
      });

      const measure = await Measure.findByPk(id);

      return res.json(measure);
    } catch (error) {
      return next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const { userId: reqId } = req;
      const reqUser = await User.findByPk(reqId);
      const { role } = reqUser || '';

      if (!id) {
        return res.status(400).json({ message: 'Invalid measure id' });
      }
      if (!reqUser) {
        return res.status(404).json({ message: 'Requesting user not found' });
      }

      if (!role || !(role === 'admin' || role === 'escritorio')) {
        return res.status(403).json({
          message: role
            ? 'User does not have enough privileges'
            : 'Role is not defined',
        });
      }

      const affectedRows = await Measure.destroy({ where: { id } });

      return res.json(affectedRows);
    } catch (error) {
      return next(error);
    }
  }
}

export default new MeasureController();
