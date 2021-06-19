"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _ProductFile = require('../../database/models/ProductFile'); var _ProductFile2 = _interopRequireDefault(_ProductFile);

class ProductFileController {
  async store(req, res, next) {
    try {
      const { id } = req.params;

      if (!id) {
        return res
          .status(400)
          .json({ error: 'Id do produto não foi informado' });
      }

      const { originalname: name, size, key, location: url = '' } = req.file;

      const file = await _ProductFile2.default.create({
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
      const file = await _ProductFile2.default.findByPk(id);

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

exports. default = new ProductFileController();
