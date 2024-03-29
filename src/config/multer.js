import multer from 'multer';
import multerS3 from 'multer-s3';
import crypto from 'crypto';
import { extname, resolve } from 'path';
import s3 from './s3';

const storageType = {
  local: multer.diskStorage({
    destination: resolve(__dirname, '..', '..', 'tmp', 'uploads'),
    filename: (req, file, cb) => {
      crypto.randomBytes(16, (err, res) => {
        if (err) return cb(err);
        file.key = `${res.toString('hex') + extname(file.originalname)}`;
        return cb(null, file.key);
      });
    },
  }),
  s3: multerS3({
    s3,
    bucket: process.env.BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: 'public-read',
    key: (req, file, cb) => {
      crypto.randomBytes(16, (err, res) => {
        if (err) return cb(err);
        file.key = `${res.toString('hex') + extname(file.originalname)}`;
        return cb(null, file.key);
      });
    },
  }),
};

const multerConfig = {
  storage: storageType[process.env.STORAGE_TYPE],
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'image/jpeg',
      'image/pjpeg',
      'image/png',
      'image/gif',
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid Format Type'));
    }
  },
};

export default multerConfig;
