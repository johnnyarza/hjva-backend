import Sequelize, { Model } from 'sequelize';
import { v4 as uuid } from 'uuid';
import aws from 'aws-sdk';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const s3 = new aws.S3();

class Avatar extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        key: Sequelize.STRING,
        user_id: Sequelize.UUID,
        url: Sequelize.STRING,
      },
      {
        hooks: {
          beforeCreate: (avatar, _) => {
            avatar.id = uuid();
            if (!avatar.url) {
              avatar.url = `${process.env.APP_URL}/files/${avatar.key}`;
            }
          },

          beforeDestroy: (avatar, _) => {
            if (process.env.STORAGE_TYPE === 's3') {
              s3.deleteObject({
                Bucket: process.env.BUCKET_NAME,
                Key: avatar.key,
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
                  avatar.key
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
      }
    );
    return this;
  }
}

export default Avatar;
