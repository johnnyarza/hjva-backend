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

    const category = await Category.create(req.body);
    return res.json(category);
  }
}

export default new CategoryController();
