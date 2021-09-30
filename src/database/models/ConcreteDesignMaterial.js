import Sequelize, { Model } from 'sequelize';
import { v4 as uuid } from 'uuid';

class ConcreteDesignMaterial extends Model {
  static init(sequelize) {
    super.init(
      {
        id: { type: Sequelize.UUID, primaryKey: true },
        quantity_per_m3: Sequelize.DECIMAL,
        material_id: {
          type: Sequelize.STRING,
          field: 'material_id',
          references: {
            model: 'Material',
            key: 'id',
          },
        },
        concrete_design_id: {
          type: Sequelize.STRING,
          field: 'concrete_design_id',
          references: {
            model: 'ConcreteDesign',
            key: 'id',
          },
        },
      },
      {
        hooks: {
          beforeCreate: (c, _) => {
            c.id = uuid();
          },
        },
        sequelize,
        tableName: 'concrete_design_materials',
      }
    );
    return this;
  }

  static associate(models) {
    this.belongsTo(models.Material, {
      foreignKey: 'material_id',
      as: 'material',
    });
    this.belongsTo(models.ConcreteDesign, {
      foreignKey: 'concrete_design_id',
      as: 'concreteDesign',
    });
  }
}

export default ConcreteDesignMaterial;
