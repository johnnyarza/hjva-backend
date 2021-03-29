import * as Yup from 'yup';

import Product from '../../database/models/Product';
import User from '../../database/models/User';
import File from '../../database/models/ProductFile';

import Utils from '../utils/utils';

class ProductController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      category: Yup.string().required(),
      description: Yup.string(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Erro de validação' });
    }
    const user = await User.findByPk(req.userId);

    if (!Utils.productsGrantedAccess.find((role) => role === user.role)) {
      return res
        .status(403)
        .json({ error: 'Usuário não tem privilégios necessários' });
    }

    const product = await Product.create(req.body);
    return res.json(product);
  }

  async index(req, res) {
    const products = await Product.findAll({
      include: [
        { model: File, as: 'file', attributes: ['name', 'url', 'path'] },
      ],
    });
    return res.json(products);
  }

  async findById(req, res) {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Id do produto não informado' });
    }

    const product = await Product.findByPk(id, {
      include: [
        { model: File, as: 'file', attributes: ['name', 'url', 'path'] },
      ],
    });

    return res.json(product);
  }

  async update(req, res) {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Id do produto não foi informado' });
    }
    const schema = Yup.object().shape({
      name: Yup.string(),
      description: Yup.string(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Erro de validação' });
    }
    const user = await User.findByPk(req.userId);

    if (!Utils.productsGrantedAccess.find((role) => role === user.role)) {
      return res
        .status(403)
        .json({ error: 'Usuário não tem privilégios necessários' });
    }

    const product = await Product.update(req.body, {
      returning: true,
      where: { id },
    });

    return res.json(product);
  }

  async delete(req, res) {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Id do produto não informado' });
    }

    const user = await User.findByPk(req.userId);

    if (!Utils.productsGrantedAccess.find((role) => role === user.role)) {
      return res
        .status(403)
        .json({ error: 'Usuário não tem privilégios necessários' });
    }

    const product = await Product.destroy({ where: { id } });

    return res.json({ affectedRows: product });
  }
}

export default new ProductController();
