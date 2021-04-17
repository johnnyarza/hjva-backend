import Avatar from '../../database/models/Avatar';

class AvatarFileController {
  async store(req, res) {
    try {
      const { userId } = req;
      let name;
      let path;
      if (process.env.STORAGE_TYPE === 's3') {
        const { key, location } = req.file;
        name = key;
        path = location;
      } else {
        const { originalname, filename } = req.file;
        name = originalname;
        path = filename;
      }
      const avatarExists = await Avatar.findOne({
        where: {
          user_id: userId,
        },
      });
      let file;

      if (avatarExists) {
        await avatarExists.update({ name, path });
        file = await Avatar.findOne({
          where: {
            user_id: userId,
          },
        });
        return res.json(file);
      }

      file = await Avatar.create({
        name,
        path,
        user_id: userId,
      });

      return res.json(file);
    } catch (error) {
      return res.status(500).json(error);
    }
  }
}

export default new AvatarFileController();
