"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _Avatar = require('../../database/models/Avatar'); var _Avatar2 = _interopRequireDefault(_Avatar);

class AvatarFileController {
  async store(req, res, next) {
    try {
      const { userId } = req;

      const { originalname: name, size, key, location: url = '' } = req.file;

      const avatarExists = await _Avatar2.default.findOne({
        where: {
          user_id: userId,
        },
      });

      if (avatarExists) {
        await avatarExists.destroy();
      }

      const file = await _Avatar2.default.create({
        name,
        key,
        user_id: userId,
        url,
      });

      return res.json(file);
    } catch (error) {
      return next(error);
    }
  }
}

exports. default = new AvatarFileController();
