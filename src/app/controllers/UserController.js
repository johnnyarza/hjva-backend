import * as Yup from 'yup';
import User from '../../database/models/User';

class UserController {
  async store(req, res) {
    try {
      const schema = Yup.object().shape({
        name: Yup.string().required(),
        email: Yup.string().email().required(),
        password: Yup.string().required().min(6),
      });

      if (!(await schema.isValid(req.body))) {
        return res.status(400).json({ error: 'Erro de validação' });
      }

      const { name, email, password } = req.body;
      const user = await User.create({ name, email, password });
      return res.json(user);
    } catch (err) {
      return res.status(400).json(err);
    }
  }

  async findById(req, res) {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'Id do usuário não informado' });
    }
    const user = await User.findByPk(id, {
      attributes: ['id', 'name', 'email', 'role'],
    });

    return res.json(user);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      oldPassword: Yup.string(),
      password: Yup.string()
        .min(6)
        .when('oldPassword', (oldPassword, field) =>
          oldPassword ? field.required() : field
        ),
      confirmPassword: Yup.string().when('password', (password, field) =>
        password ? field.required().oneOf([Yup.ref('password')]) : field
      ),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Erro de validação' });
    }

    const { email, oldPassword } = req.body;

    const user = await User.findByPk(req.userId);

    if (!!email && email !== user.email) {
      const userExists = await User.findOne({
        where: { email },
      });

      if (userExists) {
        return res.status(400).json({ error: 'Email já em uso' });
      }
    }

    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.status(401).json({ error: 'Senha inválida' });
    }

    const response = await user.update(req.body);
    const newUser = await User.findByPk(response.id);

    const { id, name } = newUser;
    return res.json({ id, name, email: newUser.email });
  }
}

export default new UserController();
