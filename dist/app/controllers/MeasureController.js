"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _yup = require('yup'); var Yup = _interopRequireWildcard(_yup);
var _Measure = require('../../database/models/Measure'); var _Measure2 = _interopRequireDefault(_Measure);
var _User = require('../../database/models/User'); var _User2 = _interopRequireDefault(_User);

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
      const measure = await _Measure2.default.create(req.body);

      return res.json(measure);
    } catch (error) {
      return next(error);
    }
  }

  async index(req, res, next) {
    try {
      const measurements = await _Measure2.default.findAll();
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

      if (!(await _Measure2.default.findByPk(id))) {
        return res.status(404).json({ message: 'Measure not found' });
      }

      await _Measure2.default.update(req.body, {
        where: { id },
      });

      const measure = await _Measure2.default.findByPk(id);

      return res.json(measure);
    } catch (error) {
      return next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const { userId: reqId } = req;
      const reqUser = await _User2.default.findByPk(reqId);
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

      const affectedRows = await _Measure2.default.destroy({ where: { id } });

      return res.json(affectedRows);
    } catch (error) {
      return next(error);
    }
  }
}

exports. default = new MeasureController();
