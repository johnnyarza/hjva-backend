import * as Yup from 'yup';
import ConcreteDesign from '../../database/models/ConcreteDesign';
import ConcreteDesignMaterial from '../../database/models/ConcreteDesignMaterial';
import Material from '../../database/models/Material';
import Measure from '../../database/models/Measure';

class ConcreteDesignMaterialController {
  async store(req, res, next) {
    const transaction = await ConcreteDesignMaterial.sequelize.transaction();
    try {
      const schema = Yup.array().of(
        Yup.object().shape({
          material_id: Yup.string().required(),
          concrete_design_id: Yup.string().required(),
          quantity_per_m3: Yup.number(),
        })
      );

      if (!(await schema.validate(req.body))) {
        return res.status(400).json({ message: 'Validation error' });
      }

      for (let i = 0; i < req.body.length; i += 1) {
        const { material_id, concrete_design_id } = req.body[i];
        // eslint-disable-next-line no-await-in-loop
        const material = await Material.findByPk(material_id);
        // eslint-disable-next-line no-await-in-loop
        const concreteDesign = await ConcreteDesign.findByPk(
          concrete_design_id
        );

        if (!(material && concreteDesign)) {
          return res.status(404).json({
            message: `${!material ? 'Material' : 'ConcreteDesign'} not found`,
          });
        }
        // eslint-disable-next-line no-await-in-loop
        const materialAlreadyInUse = await ConcreteDesignMaterial.findOne({
          where: {
            material_id,
            concrete_design_id,
          },
        });

        if (materialAlreadyInUse) {
          return res.status(400).json({
            message: 'Material already in use for this concrete design',
          });
        }
      }

      const response = await ConcreteDesignMaterial.bulkCreate(req.body, {
        transaction,
        individualHooks: true,
        returning: ['id'],
      });

      await transaction.commit();

      const concreteDesignMaterial = await Promise.all(
        response.map(({ id }) =>
          ConcreteDesignMaterial.findByPk(id, {
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
          })
        )
      );

      return res.json(concreteDesignMaterial);
    } catch (error) {
      await transaction.rollback();
      return next(error);
    }
  }

  async index(req, res, next) {
    try {
      const concreteDesingMaterials = await ConcreteDesignMaterial.findAll();
      return res.json(concreteDesingMaterials);
    } catch (error) {
      return next(error);
    }
  }

  async update(req, res, next) {
    const transaction = await ConcreteDesignMaterial.sequelize.transaction();
    try {
      const schema = Yup.array().of(
        Yup.object()
          .shape({
            id: Yup.string().required(),
            material_id: Yup.string(),
            quantity_per_m3: Yup.number(),
          })
          .required()
      );

      if (!(await schema.isValid(req.body))) {
        res.status(400).json({ message: 'Validation Error' });
      }

      await Promise.all(
        req.body.map(({ id, material_id, quantity_per_m3 }) =>
          ConcreteDesignMaterial.update(
            { material_id, quantity_per_m3 },
            { where: { id }, transaction }
          )
        )
      );

      await transaction.commit();

      const concreteDesignMaterial = await Promise.all(
        req.body.map(({ id }) =>
          ConcreteDesignMaterial.findByPk(id, {
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
          })
        )
      );

      return res.json(concreteDesignMaterial);
    } catch (error) {
      await transaction.rollback();
      return next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ message: 'ConcreteDesignId is empty' });
      }

      const affectedRows = await ConcreteDesignMaterial.destroy({
        where: { id },
      });

      return res.json(affectedRows);
    } catch (error) {
      return next(error);
    }
  }
}
export default new ConcreteDesignMaterialController();
