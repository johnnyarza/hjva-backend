import Role from '../../database/models/Role';

class RoleController {
  async index(req, res) {
    try {
      const roles = await Role.findAll();
      return res.json(roles);
    } catch (error) {
      return res.status(500).json(error.message);
    }
  }
}

export default new RoleController();
