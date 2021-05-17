import * as Yup from 'yup';
import Category from '../../database/models/Category';
import Material from '../../database/models/Material';
import Product from '../../database/models/Product';
import User from '../../database/models/User';

class CategoryController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ message: 'Erro de validação' });
    }

    const categoryExists = await Category.findOne({
      where: { name: req.body.name },
    });

    if (categoryExists) {
      return res.status(400).json({ message: 'Categoria já existe' });
    }

    const category = await Category.create(req.body);
    return res.json(category);
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { userId: requestingId } = req;
      const requestingUser = await User.findByPk(requestingId);
      const schema = Yup.object().shape({
        name: Yup.string().required(),
      });

      if (!(await schema.isValid(req.body))) {
        return res.status(400).json({ message: 'Erro de validação' });
      }

      if (!id) {
        return res
          .status(400)
          .json({ message: 'Id da categoria não informado' });
      }

      const oldCategory = await Category.findByPk(id);

      if (!oldCategory) {
        return res.status(404).json({ message: 'Categoria no encontrada' });
      }

      if (!requestingUser) {
        return res.status(404).json({ message: 'Requesting user not found' });
      }

      const { role } = requestingUser;

      if (!(role === 'admin' || role === 'escritorio')) {
        return res
          .status(403)
          .json({ message: 'Usuario no tiene suficientes privilegios ' });
      }

      await Category.update(req.body, { where: { id } });

      const category = await Category.findByPk(id);

      return res.json(category);
    } catch (error) {
      return next(error);
    }
  }

  async index(req, res) {
    const categories = await Category.findAll();
    return res.json(categories);
  }

  async findByName(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ message: 'Erro de validação' });
    }

    const category = await Category.findOne({
      where: { name: req.body.name },
    });

    return res.json(category);
  }

  async delete(req, res) {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: 'Id da categoria não informado' });
    }

    const product = await Product.findOne({ where: { category_id: id } });
    const material = await Material.findOne({ where: { category_id: id } });

    if (product || material) {
      return res
        .status(403)
        .json({ message: 'Existe producto(s) utilizando esta categoria' });
    }

    await Category.destroy({ where: { id } });

    return res.json('Categoria deletada');
  }
}

export default new CategoryController();
