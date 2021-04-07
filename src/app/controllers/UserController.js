import * as Yup from 'yup';
import User from '../../database/models/User';

class UserController {
  async store(req, res) {
    try {
      const schema = Yup.object().shape({
        name: Yup.string().required(),
        email: Yup.string().email().required().lowercase(),
        password: Yup.string().required().min(6),
      });

      if (!(await schema.isValid(req.body))) {
        return res.status(400).json({ error: 'Erro de validação' });
      }

      const { name, email, password } = req.body;
      const user = await User.create({
        name,
        email: email.toLowerCase(),
        password,
      });
      return res.json(user);
    } catch (err) {
      return res.status(400).json(err);
    }
  }

  async findById(req, res) {
    const id = req.userId;
    if (!id) {
      return res.status(400).json({ error: 'Id do usuário não informado' });
    }
    const user = await User.findByPk(id, {
      attributes: ['id', 'role'],
    });

    return res.json(user);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email().lowercase(),
      oldPassword: Yup.string(),
      password: Yup.string().when('oldPassword', (oldPassword, field) =>
        oldPassword ? field.required().min(6) : field
      ),
      confirmPassword: Yup.string().when('password', (password, field) =>
        password ? field.required().oneOf([Yup.ref('password')]) : field
      ),
    });

    if (!req.body) {
      return res.status(400).json({ error: 'Corpo da requisição vazio' });
    }

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
    if (req.body.email) req.body.email = req.body.email.toLowerCase();
    const response = await user.update(req.body);
    const newUser = await User.findByPk(response.id);

    const { id, name } = newUser;
    return res.json({ id, name, email: newUser.email });
  }
}

export default new UserController();
