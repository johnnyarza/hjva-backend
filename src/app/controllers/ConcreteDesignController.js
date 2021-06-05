import * as Yup from 'yup';

import ConcreteDesign from '../../database/models/ConcreteDesign';
import ConcreteDesignMaterial from '../../database/models/ConcreteDesignMaterial';
import Material from '../../database/models/Material';
import Measure from '../../database/models/Measure';

class ConcreteDesignController {
  async store(req, res, next) {
    const transaction = await ConcreteDesign.sequelize.transaction();
    try {
      const schema = Yup.object().shape({
        name: Yup.string().required(),
        slump: Yup.number(),
        notes: Yup.string(),
        concreteDesignMaterial: Yup.array().of(
          Yup.object().shape({
            material_id: Yup.string().required(),
            quantity_per_m3: Yup.number().required(),
          })
        ),
      });

      if (!(await schema.isValid(req.body))) {
        return res.status(400).json({ message: 'Erro de validação' });
      }

      const { name, notes } = req.body;

      const concreteDesign = await ConcreteDesign.create(
        { name, notes },
        { transaction }
      );

      const concreteDesignMaterial = req.body.concreteDesignMaterial.map(
        (c) => ({
          ...c,
          concrete_design_id: concreteDesign.id,
        })
      );

      await ConcreteDesignMaterial.bulkCreate(concreteDesignMaterial, {
        individualHooks: true,
        transaction,
      });

      await transaction.commit();

      const result = await ConcreteDesign.findByPk(concreteDesign.id, {
        include: [
          {
            model: ConcreteDesignMaterial,
            as: 'concreteDesignMaterial',
            attributes: ['id', 'quantity_per_m3'],
            include: [
              {
                model: Material,
                as: 'material',
                attributes: ['id', 'name'],
                include: [
                  {
                    model: Measure,
                    as: 'measurement',
                    attributes: ['id', 'abbreviation'],
                  },
                ],
              },
            ],
          },
        ],
      });

      return res.json(result);
    } catch (error) {
      await transaction.rollback();
      return next(error);
    }
  }

  async index(req, res, next) {
    try {
      const concreteDesings = await ConcreteDesign.findAll({
        include: [
          {
            model: ConcreteDesignMaterial,
            as: 'concreteDesignMaterial',
            attributes: ['id', 'quantity_per_m3'],
            include: [
              {
                model: Material,
                as: 'material',
                attributes: ['id', 'name'],
                include: [
                  {
                    model: Measure,
                    as: 'measurement',
                    attributes: ['id', 'abbreviation'],
                  },
                ],
              },
            ],
          },
        ],
      });
      return res.json(concreteDesings);
    } catch (error) {
      return next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const schema = Yup.object().shape({
        name: Yup.string().required(),
        slump: Yup.number(),
        notes: Yup.string(),
      });

      if (!(await schema.isValid(req.body))) {
        return res.status(400).json({ message: 'Validation error' });
      }

      const concreteDesignExists = await ConcreteDesign.findByPk(id);

      if (!concreteDesignExists) {
        return res.status(404).json({ message: 'Concrete Design not found' });
      }

      await ConcreteDesign.update(req.body, { where: { id } });

      const concreteDesign = await ConcreteDesign.findByPk(id, {
        include: [
          {
            model: ConcreteDesignMaterial,
            as: 'concreteDesignMaterial',
            attributes: ['id', 'quantity_per_m3'],
            include: [
              {
                model: Material,
                as: 'material',
                attributes: ['id', 'name'],
                include: [
                  {
                    model: Measure,
                    as: 'measurement',
                    attributes: ['id', 'abbreviation'],
                  },
                ],
              },
            ],
          },
        ],
      });

      return res.json(concreteDesign);
    } catch (error) {
      return next(error);
    }
  }

  async delete(req, res, next) {
    const transaction = await ConcreteDesign.sequelize.transaction();
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ message: 'ConcreteDesign id empty' });
      }

      const affectedRows = await ConcreteDesign.destroy({
        where: { id },
        transaction,
      });

      transaction.commit();
      return res.json(affectedRows);
    } catch (error) {
      transaction.rollback();
      return next(error);
    }
  }
}
export default new ConcreteDesignController();
