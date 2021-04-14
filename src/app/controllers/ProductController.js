import * as Yup from 'yup';

import Product from '../../database/models/Product';
import User from '../../database/models/User';
import File from '../../database/models/ProductFile';
import Category from '../../database/models/Category';

import Utils from '../utils/utils';

class ProductController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      category: Yup.string().required(),
      description: Yup.string(),
      price: Yup.number(),
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
    const category = await Category.findOne({
      where: {
        name: req.body.category,
      },
    });
    if (!category) {
      return res.status(400).send('Categoria informada não foi encontrada');
    }
    const { id: category_id } = category;
    const { id } = await Product.create({ category_id, ...req.body });

    const response = await Product.findByPk(id, {
      include: {
        model: Category,
        as: 'category',
        attributes: ['name'],
      },
    });
    const product = response.dataValues;
    product.category = product.category.name;

    return res.json(product);
  }

  async index(req, res) {
    const data = await Product.findAll({
      include: [
        { model: File, as: 'file', attributes: ['name', 'url', 'path'] },
        { model: Category, as: 'category', attributes: ['name'] },
      ],
    });
    const products = data.map(
      ({
        id,
        name,
        description,
        price,
        file,
        category,
        createdAt,
        updatedAt,
      }) => ({
        id,
        name,
        category: category.name,
        description,
        price,
        file,
        createdAt,
        updatedAt,
      })
    );
    return res.json(products);
  }

  async findById(req, res) {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Id do produto não informado' });
    }

    const data = await Product.findByPk(id, {
      include: [
        { model: File, as: 'file', attributes: ['name', 'url', 'path'] },
        { model: Category, as: 'category', attributes: ['name'] },
      ],
    });

    const {
      id: idNew,
      name,
      description,
      file,
      category,
      createdAt,
      updatedAt,
      price,
    } = data;
    const product = {
      id: idNew,
      name,
      category: category.name,
      description,
      price,
      file,
      createdAt,
      updatedAt,
    };

    return res.json(product);
  }

  async update(req, res) {
    // acrescentar atualização de categoria
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Id do produto não foi informado' });
    }

    const schema = Yup.object().shape({
      name: Yup.string(),
      category: Yup.string(),
      description: Yup.string(),
      price: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Erro de validação' });
    }

    const user = await User.findByPk(req.userId);

    const category = (
      await Category.findOne({
        where: { name: req.body.category },
      })
    ).dataValues;

    if (!category) {
      return res.status(400).json({ error: 'Categoria não encontrada' });
    }

    if (!Utils.productsGrantedAccess.find((role) => role === user.role)) {
      return res
        .status(403)
        .json({ error: 'Usuário não tem privilégios necessários' });
    }

    req.body.category_id = category.id;

    await Product.update(req.body, {
      where: { id },
    });

    const product = (
      await Product.findByPk(id, {
        include: [
          { model: File, as: 'file', attributes: ['name', 'url', 'path'] },
          { model: Category, as: 'category', attributes: ['id', 'name'] },
        ],
      })
    ).dataValues;

    delete product.category_id;
    product.category = product.category.name;

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
