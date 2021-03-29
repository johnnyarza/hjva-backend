import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import ProductController from './app/controllers/ProductController';
import SessionController from './app/controllers/SessionController';
import ProductFileController from './app/controllers/ProductFileController';

import auth from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

routes.get('/', (req, res) => res.json({ message: 'Hello world' }));
routes.post('/user', UserController.store);
routes.post('/session', SessionController.store);
routes.get('/product', ProductController.index);

routes.use(auth);

routes.put('/user', UserController.update);

routes.post('/product', ProductController.store);

routes.get('/product/:id', ProductController.findById);
routes.put('/product/:id', ProductController.update);
routes.delete('/product/:id', ProductController.delete);

routes.post(
  '/product/:id/file',
  upload.single('file'),
  ProductFileController.store
);

export default routes;
