"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _jsonwebtoken = require('jsonwebtoken'); var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);
var _yup = require('yup'); var Yup = _interopRequireWildcard(_yup);
var _User = require('../../database/models/User'); var _User2 = _interopRequireDefault(_User);
var _auth = require('../../config/auth'); var _auth2 = _interopRequireDefault(_auth);

class SessionController {
  async store(req, res) {
    const schema = Yup.object().shape({
      password: Yup.string().required(),
      email: Yup.string().email().required().lowercase(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ erro: 'Erro de validação' });
    }

    const { email, password } = req.body;

    const user = await _User2.default.findOne({ where: { email: email.toLowerCase() } });

    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    if (!(await user.checkPassword(password))) {
      return res.status(400).json({ erro: 'Senha inválida' });
    }
    const { id, name, role } = user;
    return res.json({
      user: { id, name, email },
      token: _jsonwebtoken2.default.sign({ id }, _auth2.default.secret, {
        expiresIn: _auth2.default.expiresIn,
      }),
    });
  }
}

exports. default = new SessionController();
