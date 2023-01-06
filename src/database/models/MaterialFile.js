import Sequelize, { Model } from 'sequelize';
import { v4 as uuid } from 'uuid';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import s3 from '../../config/s3';

class MaterialFile extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        key: Sequelize.STRING,
        material_id: Sequelize.UUID,
        url: Sequelize.STRING,
      },
      {
        hooks: {
          beforeCreate: (file, _) => {
            file.id = uuid();

            if (!file.url) {
              file.url = `${process.env.APP_URL}/files/${file.key}`;
            }
            if (file.url) {
              file.url = `${process.env.PUBLIC_BUCKET_URL}/${file.key}`;
            }
          },

          beforeDestroy: (file, _) => {
            if (process.env.STORAGE_TYPE === 's3') {
              s3.deleteObject({
                Bucket: process.env.BUCKET_NAME,
                Key: file.key,
              })
                .promise()
                .catch((err) => {
                  throw err;
                });
            } else {
              promisify(fs.unlink)(
                path.resolve(
                  __dirname,
                  '..',
                  '..',
                  '..',
                  'tmp',
                  'uploads',
                  file.key
                )
              )
                .then()
                .catch((err) => {
                  throw new Error(err);
                });
            }
          },
        },
        sequelize,
        tableName: 'material_files',
      }
    );
    return this;
  }

  static associate(models) {
    this.belongsTo(models.Material, {
      foreignKey: 'material_id',
      as: 'materials',
    });
  }
}

export default MaterialFile;
