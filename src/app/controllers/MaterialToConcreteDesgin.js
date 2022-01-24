import * as Yup from 'yup';
import ConcreteDesignMaterial from '../../database/models/ConcreteDesignMaterial';
import Material from '../../database/models/Material';
import Measure from '../../database/models/Measure';
import Category from '../../database/models/Category';
import Provider from '../../database/models/Provider';
import MaterialToConcreteDesign from '../../database/models/MaterialToConcreteDesign';

class MaterialToConcreteDesignController {
  async delete(req, res, next) {
    const transaction = await MaterialToConcreteDesign.sequelize.transaction();
    try {
      const { id } = req.params;
      if (!id) {
        await transaction.rollback();
        return res.status(400).json({ message: 'id is empty' });
      }

      const inUse = await ConcreteDesignMaterial.count({
        where: {
          material_id: id,
        },
      });
      if (inUse) {
        await transaction.rollback();
        return res.status(403).json({ message: 'Material en uso' });
      }

      const affectedLines = await MaterialToConcreteDesign.destroy({
        where: { material_id: id },
      });
      await transaction.commit();
      return res.json(affectedLines);
    } catch (error) {
      await transaction.rollback();
      return next(error);
    }
  }

  async index(req, res, next) {
    try {
      const materialsToConcreteDesigns = await MaterialToConcreteDesign.findAll(
        {
          include: [
            {
              model: Material,
              as: 'material',
              include: [
                { model: Measure, as: 'measurement' },
                { model: Category, as: 'category' },
                { model: Provider, as: 'provider' },
              ],
            },
          ],
        }
      );
      return res.json(materialsToConcreteDesigns);
    } catch (error) {
      return next(error);
    }
  }

  async store(req, res, next) {
    const transaction = await MaterialToConcreteDesign.sequelize.transaction();
    try {
      const schema = Yup.object().shape({
        materialId: Yup.string().required(),
      });

      if (!(await schema.isValid(req.body))) {
        await transaction.rollback();
        return res.status(400).json({ message: 'Erro de validação' });
      }

      const { materialId } = req.body;

      const material = await Material.findByPk(materialId);
      if (!material) {
        await transaction.rollback();
        return res.status(404).json({
          message: `Material not found`,
        });
      }

      const exists = await MaterialToConcreteDesign.findOne({
        where: { material_id: materialId },
      });
      if (exists) {
        await transaction.rollback();
        return res.status(404).json({
          message: `Material already exists`,
        });
      }

      const materialToConcreteDesign = await MaterialToConcreteDesign.create({
        material_id: materialId,
      });
      await transaction.commit();
      return res.json(materialToConcreteDesign);
    } catch (error) {
      await transaction.rollback();
      return next(error);
    }
  }
}
export default new MaterialToConcreteDesignController();
