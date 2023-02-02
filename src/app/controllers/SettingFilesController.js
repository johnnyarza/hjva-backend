import File from '../../database/models/SettingFile';

class SettingFilesController {
  async store(req, res, next) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ error: 'Setting id was not informed' });
      }

      const { originalname: name, size, key, location: url = '' } = req.file;

      const file = await File.create({
        name,
        key,
        setting_id: id,
        url,
      });

      return res.json(file);
    } catch (error) {
      return next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ error: 'Setting key not informed' });
      }
      const file = await File.findOne({ where: { setting_id: id } });

      if (file) {
        await file.destroy();
      }

      // if (!file) {
      //   return res.status(400).json({ error: 'Arquivo não encontrado' });
      // }

      return next();
    } catch (error) {
      return next(error);
    }
  }
}

export default new SettingFilesController();
