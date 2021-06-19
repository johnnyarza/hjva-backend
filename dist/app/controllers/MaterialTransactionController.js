"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _yup = require('yup'); var Yup = _interopRequireWildcard(_yup);
var _Category = require('../../database/models/Category'); var _Category2 = _interopRequireDefault(_Category);
var _Client = require('../../database/models/Client'); var _Client2 = _interopRequireDefault(_Client);
var _Material = require('../../database/models/Material'); var _Material2 = _interopRequireDefault(_Material);
var _MaterialTransaction = require('../../database/models/MaterialTransaction'); var _MaterialTransaction2 = _interopRequireDefault(_MaterialTransaction);
var _Measure = require('../../database/models/Measure'); var _Measure2 = _interopRequireDefault(_Measure);
var _Provider = require('../../database/models/Provider'); var _Provider2 = _interopRequireDefault(_Provider);
var _User = require('../../database/models/User'); var _User2 = _interopRequireDefault(_User);

const checkIfObjectsExists = async (
  materialId = '',
  clientId = '',
  providerId = ''
) => {
  if (!(materialId || clientId || providerId)) return { exists: false };

  const res = { exists: true };
  if (materialId) {
    const material = await _Material2.default.findByPk(materialId);
    if (!material) return { model: 'material', exists: false };
  }
  if (clientId) {
    const client = await _Client2.default.findByPk(clientId);
    if (!client) return { model: 'client', exists: false };
  }
  if (providerId) {
    const provider = await _Provider2.default.findByPk(providerId);
    if (!provider) return { model: 'provider', exists: false };
  }
  return res;
};

const findByPkDefaultOptions = {
  order: [['created_at', 'DESC']],
  attributes: {
    exclude: [
      'materialId',
      'material_id',
      'clientId',
      'client_id',
      'providerId',
      'provider_id',
      'previous_qty',
    ],
  },
  include: [
    {
      model: _Client2.default,
      as: 'client',
      attributes: ['id', 'name'],
    },
    {
      model: _Provider2.default,
      as: 'provider',
      attributes: ['id', 'name'],
    },
    {
      model: _Material2.default,
      as: 'material',
      attributes: ['id', 'name', 'stock_qty'],
      include: [
        {
          model: _Measure2.default,
          as: 'measurement',
          attributes: ['abbreviation'],
        },
        {
          model: _Category2.default,
          as: 'category',
          attributes: ['name'],
        },
      ],
    },
  ],
};

class MaterialTransactionController {
  async store(req, res, next) {
    const transaction = await _MaterialTransaction2.default.sequelize.transaction();
    try {
      const { materialId, clientId, providerId } = req.body;
      const schema = Yup.object().shape(
        {
          entry: Yup.number(),
          notes: Yup.string(),
          materialId: Yup.string().required(),
          clientId: Yup.string().when(
            'providerId',
            (providerIdField, field) => {
              if (!providerIdField) {
                return field.required();
              }
              return field;
            }
          ),
          providerId: Yup.string().when('clientId', (clientIdField, field) => {
            if (!clientIdField) {
              return field.required();
            }
            return field;
          }),
        },
        [['clientId', 'providerId']]
      );

      if (!(await schema.isValid(req.body))) {
        return res.status(400).json({ message: 'Validation Error' });
      }

      if (providerId && clientId) {
        return res
          .status(400)
          .json({ message: 'Provide only ClientId or ProviderId' });
      }

      const { exists, model } = await checkIfObjectsExists(
        '',
        clientId,
        providerId
      );

      if (!exists) {
        return res.status(404).json({ message: `${model} does not exist` });
      }

      const material = await _Material2.default.findByPk(materialId);

      if (!material) {
        return res.status(404).json({ message: `Material does not exist` });
      }

      const { stockQty: previousQty } = material;

      const { id } = await _MaterialTransaction2.default.create(
        {
          previousQty,
          ...req.body,
        },
        transaction
      );

      const sum = await _MaterialTransaction2.default.sum('entry', {
        where: { material_id: materialId },
      });

      await _Material2.default.update(
        { stockQty: sum },
        { where: { id: materialId }, transaction }
      );
      await transaction.commit();
      const materialTransaction = await _MaterialTransaction2.default.findByPk(
        id,
        findByPkDefaultOptions
      );

      return res.json(materialTransaction);
    } catch (error) {
      await transaction.rollback();
      return next(error);
    }
  }

  async delete(req, res, next) {
    const transaction = await _MaterialTransaction2.default.sequelize.transaction();
    try {
      const { id } = req.params;
      const { userId } = req;

      if (!id) {
        return res.status(400).json({ message: 'Id is empty' });
      }
      if (!userId) {
        return res.status(400).json({ message: 'UserId is empty' });
      }
      const userExists = await _User2.default.findByPk(userId);

      if (!userExists) {
        return res.status(404).json({ message: 'User not found' });
      }
      const { role: userRole } = userExists;

      if (userRole !== 'admin') {
        return res
          .status(403)
          .json({ message: 'user does not have enough privileges' });
      }

      const materialTransaction = await _MaterialTransaction2.default.findByPk(
        id,
        findByPkDefaultOptions
      );

      const { material } = materialTransaction;
      const { id: material_id } = material;

      const affectedRows = await _MaterialTransaction2.default.destroy({
        where: { id },
        transaction,
      });

      const sum = await _MaterialTransaction2.default.sum('entry', {
        where: { material_id },
        transaction,
      });

      await _Material2.default.update(
        { stockQty: sum },
        { where: { id: material_id }, transaction }
      );

      await transaction.commit();
      return res.json(affectedRows);
    } catch (error) {
      await transaction.rollback();
      return next(error);
    }
  }

  async index(req, res, next) {
    try {
      const matTrans = await _MaterialTransaction2.default.findAll(
        findByPkDefaultOptions
      );
      return res.json(matTrans);
    } catch (error) {
      return next(error);
    }
  }

  async update(req, res, next) {
    const transaction = await _MaterialTransaction2.default.sequelize.transaction();
    try {
      const { providerId, clientId, materialId } = req.body;
      const { id } = req.params;
      const schema = Yup.object().shape({
        entry: Yup.number(),
        notes: Yup.string(),
        materialId: Yup.string().required(),
        clientId: Yup.string(),
        providerId: Yup.string(),
      });

      if (!id) {
        return res.status(400).json({ message: 'Id is empty' });
      }

      if (!(await schema.isValid(req.body))) {
        return res.status(400).json({ message: 'Validation error' });
      }

      if (providerId && clientId) {
        return res
          .status(400)
          .json({ message: 'Provide only ClientId or ProviderId' });
      }

      if (providerId && !clientId) {
        req.body.clientId = null;
      }
      if (clientId && !providerId) {
        req.body.providerId = null;
      }

      const { model, exists } = await checkIfObjectsExists(
        '',
        clientId,
        providerId
      );

      if (!exists) {
        return res.status(404).json({ message: `${model} does not exist` });
      }

      const material = await _Material2.default.findByPk(materialId);
      if (!material) {
        return res.status(404).json({ message: `Material does not exist` });
      }

      const materialTransactionExists = await _MaterialTransaction2.default.findByPk(id);

      if (!materialTransactionExists) {
        return res
          .status(404)
          .json({ message: `Material Transaction does not exist` });
      }

      const { material_id: currentMaterialId } = materialTransactionExists;

      if (currentMaterialId !== materialId) {
        return res
          .status(403)
          .json({ message: `Informed Material is not the same` });
      }

      await _MaterialTransaction2.default.update(req.body, {
        where: { id },
        transaction,
      });

      if (req.body.entry) {
        const sum = await _MaterialTransaction2.default.sum('entry', {
          where: { material_id: materialId },
          transaction,
        });
        await _Material2.default.update(
          { stockQty: sum },
          { where: { id: materialId }, transaction }
        );
      }
      await transaction.commit();

      const materialTransaction = await _MaterialTransaction2.default.findByPk(
        id,
        findByPkDefaultOptions
      );

      return res.json(materialTransaction);
    } catch (error) {
      await transaction.rollback();
      return next(error);
    }
  }
}

exports. default = new MaterialTransactionController();
