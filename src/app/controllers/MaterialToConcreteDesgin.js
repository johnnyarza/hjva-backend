import * as Yup from 'yup';
import Material from '../../database/models/Material';
import MaterialToConcreteDesign from '../../database/models/MaterialToConcreteDesign';

class MaterialToConcreteDesignController {
  async index(req, res, next) {
    try {
      const materialsToConcreteDesigns = await MaterialToConcreteDesign.findAll(
        { include: [{ model: Material, as: 'materials' }] }
      );
      return res.json(materialsToConcreteDesigns);
    } catch (error) {
      return next(error);
    }
  }

  async store(req, res, next) {
    try {
      const schema = Yup.object().shape({
        materialId: Yup.string().required(),
      });

      if (!(await schema.isValid(req.body))) {
        return res.status(400).json({ message: 'Erro de validação' });
      }

      const { materialId } = req.body;

      const material = await Material.findByPk(materialId);
      if (!material) {
        return res.status(404).json({
          message: `Material not found`,
        });
      }

      const exists = await MaterialToConcreteDesign.findOne({
        where: { material_id: materialId },
      });
      if (exists) {
        return res.status(404).json({
          message: `Material already exists`,
        });
      }

      const materialToConcreteDesign = await MaterialToConcreteDesign.create({
        material_id: materialId,
      });

      return res.json(materialToConcreteDesign);
    } catch (error) {
      return next(error);
    }
  }
}
export default new MaterialToConcreteDesignController();
