import * as Yup from 'yup';
import Category from '../../database/models/Category';
import Product from '../../database/models/Product';

class CategoryController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
    });
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Erro de validação' });
    }

    const categoryExists = await Category.findOne({
      where: { name: req.body.name },
    });

    if (categoryExists) {
      return res.status(400).json({ error: 'Categoria já existe' });
    }

    const category = await Category.create(req.body);
    return res.json(category);
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
      return res.status(400).json({ error: 'Erro de validação' });
    }

    const category = await Category.findOne({
      where: { name: req.body.name },
    });

    return res.json(category);
  }

  async delete(req, res) {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Id da categoria não informado' });
    }
    const product = await Product.findOne({ where: { category_id: id } });

    if (product) {
      return res
        .status(403)
        .json({ error: 'Existe produto usando essa categoria' });
    }

    await Category.destroy({ where: { id } });

    return res.json('Categoria deletada');
  }
}

export default new CategoryController();
