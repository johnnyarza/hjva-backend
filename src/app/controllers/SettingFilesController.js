import File from '../../database/models/SettingFile';

class SettingFilesController {
  async store(req, res, next) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ error: 'Id dela config no informado' });
      }

      const { originalname: name, size, key, location: url = '' } = req.file;

      const file = await File.create({
        name,
        key,
        product_id: id,
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
        return res
          .status(400)
          .json({ error: 'Key do arquivo não foi informado' });
      }
      const file = await File.findByPk(id);

      if (!file) {
        return res.status(400).json({ error: 'Arquivo não encontrado' });
      }

      await file.destroy();

      return res.json(file);
    } catch (error) {
      return next(error);
    }
  }
}

export default new SettingFilesController();
