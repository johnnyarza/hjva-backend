import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import CategoryController from './app/controllers/CategoryController';
import ProductController from './app/controllers/ProductController';
import SessionController from './app/controllers/SessionController';
import ProductFileController from './app/controllers/ProductFileController';

import auth from './app/middlewares/auth';
import RoleController from './app/controllers/RoleController';
import AvatarFileController from './app/controllers/AvatarFileController';
import CLientController from './app/controllers/ClientController';
import ProviderController from './app/controllers/ProviderController';
import MaterialController from './app/controllers/MaterialController';

const routes = new Router();
const upload = multer(multerConfig);

routes.get('/', (req, res) => res.json({ message: 'Hello world' }));
routes.post('/user', UserController.store);
routes.post('/session', SessionController.store);
routes.get('/product', ProductController.index);
routes.get('/product/:id', ProductController.findById);

routes.use(auth);

routes.get('/roles', RoleController.index);

routes.put('/user', UserController.update);
routes.delete('/user/:userToBeDeleteId', UserController.deleteUser);
routes.put('/user/role/:userToUpdateRoleId', UserController.updateUserRole);
routes.put(
  '/user/password/:userToUpdatePasswordId',
  UserController.resetUserPassword
);
routes.get('/user', UserController.findById);
routes.get('/users', UserController.index);
routes.post('/users/avatar', upload.single('file'), AvatarFileController.store);

routes.post('/category', CategoryController.store);
routes.get('/categories', CategoryController.index);
routes.get('/category/byname', CategoryController.findByName);
routes.delete('/category/:id', CategoryController.delete);

routes.post('/product', ProductController.store);
routes.put('/product/:id', ProductController.update);
routes.delete('/product/:id', ProductController.delete);

routes.post(
  '/product/:id/file',
  upload.single('file'),
  ProductFileController.store
);

routes.delete('/product/:id/file', ProductFileController.delete);

routes.post('/client', CLientController.store);
routes.put('/client/:id', CLientController.update);
routes.delete('/client/:id', CLientController.delete);
routes.get('/clients', CLientController.index);

routes.post('/provider', ProviderController.store);
routes.put('/provider/:id', ProviderController.update);
routes.delete('/provider/:id', ProviderController.delete);
routes.get('/providers', ProviderController.index);

routes.post('/material', MaterialController.store);
routes.get('/materials', MaterialController.index);
routes.put('/material/:id', MaterialController.update);
routes.delete('/material/:id', MaterialController.delete);

export default routes;
