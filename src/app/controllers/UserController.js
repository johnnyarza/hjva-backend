import * as Yup from 'yup';
import User from '../../database/models/User';
import Role from '../../database/models/Role';

class UserController {
  async deleteUser(req, res) {
    try {
      const { userToBeDeleteId } = req.params;
      if (!userToBeDeleteId) {
        return res
          .status(400)
          .json({ error: 'Id do usuário a ser deletado não informado' });
      }
      const { dataValues: userRequesting } = await User.findByPk(req.userId);

      if (!userRequesting) {
        return res.status(403).json({
          error: 'Usuário que está solicitando não foi encontrado',
        });
      }

      if (req.id !== userToBeDeleteId && userRequesting.role !== 'admin') {
        return res.status(403).json({
          error: 'Apenas administradores podem apagar contas de terceiros',
        });
      }

      if (req.userId === userToBeDeleteId && userRequesting.role === 'admin') {
        const count = await User.count({ where: { name: 'admin' } });
        if (count <= 1) {
          return res.status(400).json({
            message: 'Deve existir pelo menos 1 administrador cadastrado',
          });
        }
      }

      const affectedLines = await User.destroy({
        where: { id: userToBeDeleteId },
      });

      return res.json(affectedLines);
    } catch (err) {
      return res.status(500).json(err.message);
    }
  }

  async index(req, res) {
    try {
      const user = await User.findByPk(req.userId);
      if (user.role !== 'admin') {
        return res
          .status(403)
          .json({ error: 'Usuário não tem privilégios necessários' });
      }
      const users = await User.findAll({ attributes: ['id', 'name', 'role'] });

      return res.json(users);
    } catch (err) {
      return res.status(500).json(err.message);
    }
  }

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
      return res.status(500).json(err);
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
    if (!user) {
      return res.status(403).json({ error: 'Usuário não encontrado' });
    }
    return res.json(user);
  }

  async avatarPicture(req, res) {
    res.json('Ola arquivo');
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
      role: Yup.string(),
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

  async updateUserRole(req, res) {
    try {
      const schema = Yup.object().shape({
        role: Yup.string().required('Role não informado'),
      });
      const { userToUpdateRoleId } = req.params;

      if (!userToUpdateRoleId) {
        return res.status(400).json({ error: 'Role não informado' });
      }

      if (!(await schema.isValid(req.body))) {
        return res.status(400).json({ error: 'Erro de validação' });
      }

      const { dataValues: userToUpdaterole } = await User.findByPk(
        userToUpdateRoleId
      );

      if (!userToUpdaterole) {
        return res
          .status(400)
          .json({ error: 'Usuário a ser atulizado não encontrado' });
      }

      const { dataValues: userUpdating } = await User.findByPk(req.userId);

      if (!userUpdating) {
        return res
          .status(400)
          .json({ error: 'Usuário solicitante não encontrado' });
      }

      if (userUpdating.role !== 'admin') {
        return res.status(403).json({
          error: 'Usuário solicitante não tem privelégios suficientes',
        });
      }
      const roleExists = await Role.findOne({ where: { name: req.body.role } });

      if (!roleExists) {
        return res.status(400).json({ error: 'Role informado não existe' });
      }

      await User.update(
        { role: req.body.role },
        {
          where: {
            id: userToUpdateRoleId,
          },
        }
      );

      const { dataValues: updatedUser } = await User.findByPk(
        userToUpdateRoleId,
        {
          attributes: ['id', 'name', 'email', 'role'],
        }
      );

      return res.json(updatedUser);
    } catch (err) {
      return res.status(500).json(err);
    }
  }

  async resetUserPassword(req, res) {
    try {
      const schema = Yup.object().shape({
        password: Yup.string().required(),
        confirmPassword: Yup.string()
          .required()
          .oneOf([Yup.ref('password')], 'As senhas devem ser iguais'),
      });
      const { userToUpdatePasswordId } = req.params;

      if (!userToUpdatePasswordId) {
        return res.status(400).json({ error: 'Id não informado' });
      }

      if (!(await schema.isValid(req.body))) {
        return res.status(400).json({ error: 'Erro de validação' });
      }

      const userToUpdatePassword = await User.findByPk(userToUpdatePasswordId);

      if (!userToUpdatePassword) {
        return res
          .status(400)
          .json({ error: 'Usuário a ser atulizado não encontrado' });
      }

      const { dataValues: userUpdating } = await User.findByPk(req.userId);

      if (!userUpdating) {
        return res
          .status(400)
          .json({ error: 'Usuário solicitante não encontrado' });
      }

      if (userUpdating.role !== 'admin') {
        return res.status(403).json({
          error: 'Usuário solicitante não tem privelégios suficientes',
        });
      }

      await userToUpdatePassword.update({ password: req.body.password });

      const { dataValues: updatedUser } = await User.findByPk(
        userToUpdatePasswordId,
        {
          attributes: ['id', 'name', 'email', 'role'],
        }
      );

      return res.json(updatedUser);
    } catch (err) {
      return res.status(500).json(err);
    }
  }
}

export default new UserController();
