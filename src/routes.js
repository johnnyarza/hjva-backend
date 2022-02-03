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
import ClientController from './app/controllers/ClientController';
import ProviderController from './app/controllers/ProviderController';
import MaterialController from './app/controllers/MaterialController';
import MeasureController from './app/controllers/MeasureController';
import ConcreteDesignMaterialController from './app/controllers/ConcreteDesignMaterialController';
import ConcreteDesignController from './app/controllers/ConcreteDesignController';
import CompressionTestController from './app/controllers/CompressionTestController';
import ConcreteSampleController from './app/controllers/ConcreteSampleController';
import MaterialTransactionController from './app/controllers/MaterialTransactionController';
import MaterialFileController from './app/controllers/MaterialFileController';
import needsToBe from './app/middlewares/needsToBe';
import MaterialToConcreteDesgin from './app/controllers/MaterialToConcreteDesgin';
import SettingsController from './app/controllers/SettingsController';
import PortifoliosController from './app/controllers/PortifoliosController';

const routes = new Router();
const upload = multer(multerConfig);

routes.get('/portifolios', PortifoliosController.index);
routes.get(
  '/compressionTests/delayed',
  CompressionTestController.getDelayedCompressionTests
);
routes.get('/settings', SettingsController.index);
routes.get('/setting/find', SettingsController.find);
routes.get('/', (req, res) => res.json({ message: 'Hello world' }));
routes.post('/user', UserController.store);
routes.post('/session', SessionController.store);
routes.get('/products', ProductController.index);
routes.get('/material/:id', MaterialController.findById);
routes.get('/materialsToSell', MaterialController.findAllToSellMaterials);
routes.get('/categories', CategoryController.index);
routes.get('/report/material', MaterialController.getReport);
routes.get('/report/category', CategoryController.getReport);
routes.get('/report/measure', MeasureController.getReport);
routes.get('/report/provider', ProviderController.getReport);
routes.get('/report/client', ClientController.getReport);
routes.get('/report/concreteDesign', ConcreteDesignController.getReport);
routes.get('/report/compressionTest', CompressionTestController.getReport);
routes.get('/report/concreteSample', ConcreteSampleController.getReport);
routes.post('/user', UserController.store);

routes.use(auth);

routes.post('/portifolio', PortifoliosController.store);
routes.put('/portifolio/:id', PortifoliosController.update);
routes.delete('/portifolio/:id', PortifoliosController.delete);

routes.delete(
  '/setting/:id',
  (req, res, next) => needsToBe(req, res, next, ['admin']),
  SettingsController.delete
);
routes.put(
  '/setting/:id',
  (req, res, next) => needsToBe(req, res, next, ['escritorio', 'admin']),
  SettingsController.update
);
routes.post('/setting', SettingsController.store);

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

routes.get(
  '/category/byname',
  (req, res, next) =>
    needsToBe(req, res, next, ['escritorio', 'admin', 'estoque', 'vendedor']),
  CategoryController.findByName
);
routes.delete(
  '/category/:id',
  (req, res, next) => needsToBe(req, res, next, ['escritorio', 'admin']),
  CategoryController.delete
);
routes.put(
  '/category/:id',
  (req, res, next) => needsToBe(req, res, next, ['escritorio', 'admin']),
  CategoryController.update
);

routes.post('/product', ProductController.store);
routes.put('/product/:id', ProductController.update);
routes.delete('/product/:id', ProductController.delete);

routes.post(
  '/product/:id/file',
  upload.single('file'),
  ProductFileController.store
);

routes.delete('/product/:id/file', ProductFileController.delete);

routes.post(
  '/client',
  (req, res, next) =>
    needsToBe(req, res, next, ['escritorio', 'admin', 'estoque']),
  ClientController.store
);
routes.put(
  '/client/:id',
  (req, res, next) => needsToBe(req, res, next, ['escritorio', 'admin']),
  ClientController.update
);
routes.delete(
  '/client/:id',
  (req, res, next) => needsToBe(req, res, next, ['escritorio', 'admin']),
  ClientController.delete
);
routes.get('/clients', ClientController.index);

routes.post(
  '/provider',
  (req, res, next) =>
    needsToBe(req, res, next, ['escritorio', 'admin', 'estoque']),
  ProviderController.store
);
routes.put(
  '/provider/:id',
  (req, res, next) => needsToBe(req, res, next, ['escritorio', 'admin']),
  ProviderController.update
);
routes.delete(
  '/provider/:id',
  (req, res, next) => needsToBe(req, res, next, ['escritorio', 'admin']),
  ProviderController.delete
);
routes.get('/providers', ProviderController.index);

routes.post(
  '/material',
  (req, res, next) =>
    needsToBe(req, res, next, ['escritorio', 'admin', 'estoque', 'vendedor']),
  MaterialController.store
);
routes.get('/materials', MaterialController.index);
routes.put(
  '/material/:id',
  (req, res, next) => needsToBe(req, res, next, ['escritorio', 'admin']),
  MaterialController.update
);

routes.delete(
  '/material/:id',
  (req, res, next) => needsToBe(req, res, next, ['escritorio', 'admin']),
  MaterialController.delete
);
routes.delete(
  '/material/:id/file',
  (req, res, next) => needsToBe(req, res, next, ['escritorio', 'admin']),
  MaterialFileController.delete
);
routes.post(
  '/material/:id/file',
  (req, res, next) =>
    needsToBe(req, res, next, ['escritorio', 'admin', 'estoque', 'vendedor']),
  upload.single('file'),
  MaterialFileController.store
);

routes.post(
  '/measure',
  (req, res, next) =>
    needsToBe(req, res, next, ['escritorio', 'admin', 'estoque']),
  MeasureController.store
);
routes.get('/measurements', MeasureController.index);
routes.put(
  '/measure/:id',
  (req, res, next) =>
    needsToBe(req, res, next, ['escritorio', 'admin', 'estoque']),
  MeasureController.update
);
routes.delete(
  '/measure/:id',
  (req, res, next) => needsToBe(req, res, next, ['escritorio', 'admin']),
  MeasureController.delete
);

routes.post(
  '/concreteDesignMaterial',
  (req, res, next) =>
    needsToBe(req, res, next, ['admin', 'escritorio', 'laboratorio']),
  ConcreteDesignMaterialController.store
);
routes.put(
  '/concreteDesignMaterial/',
  (req, res, next) => needsToBe(req, res, next, ['admin', 'escritorio']),
  ConcreteDesignMaterialController.update
);
routes.get('/concreteDesignMaterials', ConcreteDesignMaterialController.index);
routes.delete(
  '/concreteDesignMaterial/:id',
  (req, res, next) => needsToBe(req, res, next, ['admin', 'escritorio']),
  ConcreteDesignMaterialController.delete
);

routes.post(
  '/concreteDesign',
  (req, res, next) =>
    needsToBe(req, res, next, ['admin', 'escritorio', 'laboratorio']),
  ConcreteDesignController.store
);
routes.put(
  '/concreteDesign/:id',
  (req, res, next) => needsToBe(req, res, next, ['admin', 'escritorio']),
  ConcreteDesignController.update
);
routes.delete(
  '/concreteDesign/:id',
  (req, res, next) => needsToBe(req, res, next, ['admin', 'escritorio']),
  ConcreteDesignController.delete
);
routes.get(
  '/concreteDesigns',
  (req, res, next) =>
    needsToBe(req, res, next, ['laboratorio', 'admin', 'escritorio']),
  ConcreteDesignController.index
);

routes.post(
  '/materialToConcreteDesign',
  (req, res, next) =>
    needsToBe(req, res, next, ['laboratorio', 'admin', 'escritorio']),
  MaterialToConcreteDesgin.store
);
routes.get(
  '/materialsToConcreteDesigns',
  (req, res, next) =>
    needsToBe(req, res, next, ['laboratorio', 'admin', 'escritorio']),
  MaterialToConcreteDesgin.index
);
routes.delete(
  '/materialsToConcreteDesign/:id',
  (req, res, next) =>
    needsToBe(req, res, next, ['laboratorio', 'admin', 'escritorio']),
  MaterialToConcreteDesgin.delete
);

routes.post(
  '/compressionTest',
  (req, res, next) =>
    needsToBe(req, res, next, ['laboratorio', 'escritorio', 'admin']),
  CompressionTestController.store
);
routes.put(
  '/compressionTest/:id',
  (req, res, next) =>
    needsToBe(req, res, next, ['laboratorio', 'escritorio', 'admin']),
  CompressionTestController.update
);
routes.delete(
  '/compressionTest/:id',
  (req, res, next) =>
    needsToBe(req, res, next, ['laboratorio', 'escritorio', 'admin']),
  CompressionTestController.delete
);
routes.get(
  '/compressionTests',
  (req, res, next) =>
    needsToBe(req, res, next, ['laboratorio', 'escritorio', 'admin']),
  CompressionTestController.index
);

routes.post(
  '/concreteSample',
  (req, res, next) =>
    needsToBe(req, res, next, ['laboratorio', 'escritorio', 'admin']),
  ConcreteSampleController.store
);
routes.put(
  '/concreteSample/:id',
  (req, res, next) =>
    needsToBe(req, res, next, ['laboratorio', 'escritorio', 'admin']),
  ConcreteSampleController.update
);
routes.delete(
  '/concreteSample/:id',
  (req, res, next) => needsToBe(req, res, next, ['escritorio', 'admin']),
  ConcreteSampleController.delete
);
routes.get(
  '/concreteSamples',
  (req, res, next) =>
    needsToBe(req, res, next, ['laboratorio', 'escritorio', 'admin']),
  ConcreteSampleController.index
);

routes.post(
  '/materialTransaction',
  (req, res, next) =>
    needsToBe(req, res, next, ['estoque', 'escritorio', 'admin']),
  MaterialTransactionController.store
);
routes.get('/materialTransactions', MaterialTransactionController.index);
routes.delete(
  '/materialTransaction/:id',
  (req, res, next) => needsToBe(req, res, next, ['escritorio', 'admin']),
  MaterialTransactionController.delete
);
routes.put(
  '/materialTransaction/:id',
  (req, res, next) => needsToBe(req, res, next, ['escritorio', 'admin']),
  MaterialTransactionController.update
);

export default routes;
