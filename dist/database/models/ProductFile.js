"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _sequelize = require('sequelize'); var _sequelize2 = _interopRequireDefault(_sequelize);
var _uuid = require('uuid');
var _awssdk = require('aws-sdk'); var _awssdk2 = _interopRequireDefault(_awssdk);
var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _util = require('util');

const s3 = new _awssdk2.default.S3();

class ProductFile extends _sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        name: _sequelize2.default.STRING,
        key: _sequelize2.default.STRING,
        product_id: _sequelize2.default.UUID,
        url: _sequelize2.default.STRING,
      },
      {
        hooks: {
          beforeCreate: (file, _) => {
            file.id = _uuid.v4.call(void 0, );
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
              _util.promisify.call(void 0, _fs2.default.unlink)(
                _path2.default.resolve(
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
        tableName: 'productsFiles',
      }
    );
    return this;
  }

  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'product_id', as: 'product' });
  }
}

exports. default = ProductFile;
