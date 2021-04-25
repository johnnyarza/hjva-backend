import Avatar from '../../database/models/Avatar';

class AvatarFileController {
  async store(req, res, next) {
    try {
      const { userId } = req;

      const { originalname: name, size, key, location: url = '' } = req.file;

      const avatarExists = await Avatar.findOne({
        where: {
          user_id: userId,
        },
      });

      if (avatarExists) {
        await avatarExists.destroy();
      }

      const file = await Avatar.create({
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

export default new AvatarFileController();
