import * as Yup from 'yup';
import Category from '../../database/models/Category';

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
}

export default new CategoryController();
