import Sequelize, { Model } from 'sequelize';
import { v4 as uuid } from 'uuid';

class MaterialToConcreteDesign extends Model {
  static init(sequelize) {
    super.init(
      {
        material_id: {
          type: Sequelize.STRING,
          field: 'material_id',
          references: {
            model: 'Material',
            key: 'id',
          },
        },
      },
      {
        hooks: {
          beforeCreate: (material, _) => {
            material.id = uuid();
          },
        },
        sequelize,
        tableName: 'materials_to_concreteDesigns',
      }
    );
    return this;
  }

  static associate(models) {
    this.belongsTo(models.Material, {
      foreignKey: 'material_id',
      as: 'material',
    });
  }
}

export default MaterialToConcreteDesign;
