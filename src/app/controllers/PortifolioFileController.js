import Portifolio from '../../database/models/Portifolio';
import File from '../../database/models/PortifolioFile';

class PortifolioFileController {
  async store(req, res, next) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ message: 'Id del portifolio vacío' });
      }

      const portifolio = await Portifolio.findByPk(id);

      if (!portifolio) {
        return res.status(400).json({ message: 'Portifolio no encontrado' });
      }

      const { originalname: name, size, key, location: url = '' } = req.file;

      const file = await File.create({
        name,
        key,
        portifolio_id: id,
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
          .json({ message: 'id do arquivo não foi informado' });
      }
      const file = await File.findByPk(id);

      if (!file) {
        return res.status(400).json({ message: 'Arquivo não encontrado' });
      }

      await file.destroy();

      return res.json(file);
    } catch (error) {
      return next(error);
    }
  }
}

export default new PortifolioFileController();
