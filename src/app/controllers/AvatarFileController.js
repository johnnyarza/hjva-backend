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

      // no
      res.json({ userId, name, path });
    } catch (error) {
      res.status(500).json(error.message);
    }
  }
}

export default new AvatarFileController();
