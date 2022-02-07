import Sequelize, { Model } from 'sequelize';
import { v4 as uuid } from 'uuid';
import aws from 'aws-sdk';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const s3 = new aws.S3();

class PortifolioFile extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        key: Sequelize.STRING,
        portifolio_id: Sequelize.UUID,
        url: Sequelize.STRING,
      },
      {
        hooks: {
          beforeCreate: (file, _) => {
            file.id = uuid();
            if (!file.url) {
              file.url = `${process.env.APP_URL}/files/${file.key}`;
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
        tableName: 'portifolio_files',
      }
    );
    return this;
  }

  static associate(models) {
    this.belongsTo(models.Portifolio, {
      foreignKey: 'portifolio_id',
      as: 'portifolios',
    });
  }
}

export default PortifolioFile;
