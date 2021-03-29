import File from '../../database/models/ProductFile';

class ProductFileController {
  async store(req, res) {
    // adequar para usar no AWS S3
    let name;
    let path;
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'Id do produto não foi informado' });
    }

    if (process.env.STORAGE_TYPE === 's3') {
      const { key, location } = req.file;
      name = key;
      path = location;
    } else {
      const { originalname, filename } = req.file;
      name = originalname;
      path = filename;
    }

    const file = await File.create({
      name,
      path,
      product_id: id,
    });
    return res.json(file);
  }
}

export default new ProductFileController();
