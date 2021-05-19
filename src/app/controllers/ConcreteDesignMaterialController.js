import * as Yup from 'yup';
import ConcreteDesign from '../../database/models/ConcreteDesign';
import ConcreteDesignMaterial from '../../database/models/ConcreteDesignMaterial';
import Material from '../../database/models/Material';

class ConcreteDesignMaterialController {
  async store(req, res, next) {
    try {
      const schema = Yup.object().shape({
        material_id: Yup.string().required(),
        concrete_design_id: Yup.string().required(),
        quantity_per_m3: Yup.number(),
      });
      const { material_id, concrete_design_id, quantity_per_m3 } = req.body;

      if (!(await schema.validate(req.body))) {
        return res.status(400).json({ message: 'Validation error' });
      }

      const material = await Material.findByPk(material_id);
      const concreteDesign = await ConcreteDesign.findByPk(concrete_design_id);

      if (!(material && concreteDesign)) {
        return res.status(404).json({
          message: `${!material ? 'Material' : 'ConcreteDesign'} not found`,
        });
      }

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

      const concreteDesignMaterial = await ConcreteDesignMaterial.create({
        material_id,
        concrete_design_id,
        quantity_per_m3,
      });

      return res.json(concreteDesignMaterial);
    } catch (error) {
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
