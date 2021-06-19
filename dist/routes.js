"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _express = require('express');
var _multer = require('multer'); var _multer2 = _interopRequireDefault(_multer);
var _multer3 = require('./config/multer'); var _multer4 = _interopRequireDefault(_multer3);

var _UserController = require('./app/controllers/UserController'); var _UserController2 = _interopRequireDefault(_UserController);
var _CategoryController = require('./app/controllers/CategoryController'); var _CategoryController2 = _interopRequireDefault(_CategoryController);
var _ProductController = require('./app/controllers/ProductController'); var _ProductController2 = _interopRequireDefault(_ProductController);
var _SessionController = require('./app/controllers/SessionController'); var _SessionController2 = _interopRequireDefault(_SessionController);
var _ProductFileController = require('./app/controllers/ProductFileController'); var _ProductFileController2 = _interopRequireDefault(_ProductFileController);

var _auth = require('./app/middlewares/auth'); var _auth2 = _interopRequireDefault(_auth);
var _RoleController = require('./app/controllers/RoleController'); var _RoleController2 = _interopRequireDefault(_RoleController);
var _AvatarFileController = require('./app/controllers/AvatarFileController'); var _AvatarFileController2 = _interopRequireDefault(_AvatarFileController);
var _ClientController = require('./app/controllers/ClientController'); var _ClientController2 = _interopRequireDefault(_ClientController);
var _ProviderController = require('./app/controllers/ProviderController'); var _ProviderController2 = _interopRequireDefault(_ProviderController);
var _MaterialController = require('./app/controllers/MaterialController'); var _MaterialController2 = _interopRequireDefault(_MaterialController);
var _MeasureController = require('./app/controllers/MeasureController'); var _MeasureController2 = _interopRequireDefault(_MeasureController);
var _ConcreteDesignMaterialController = require('./app/controllers/ConcreteDesignMaterialController'); var _ConcreteDesignMaterialController2 = _interopRequireDefault(_ConcreteDesignMaterialController);
var _ConcreteDesignController = require('./app/controllers/ConcreteDesignController'); var _ConcreteDesignController2 = _interopRequireDefault(_ConcreteDesignController);
var _CompressionTestController = require('./app/controllers/CompressionTestController'); var _CompressionTestController2 = _interopRequireDefault(_CompressionTestController);
var _ConcreteSampleController = require('./app/controllers/ConcreteSampleController'); var _ConcreteSampleController2 = _interopRequireDefault(_ConcreteSampleController);
var _MaterialTransactionController = require('./app/controllers/MaterialTransactionController'); var _MaterialTransactionController2 = _interopRequireDefault(_MaterialTransactionController);

const routes = new (0, _express.Router)();
const upload = _multer2.default.call(void 0, _multer4.default);

routes.get('/', (req, res) => res.json({ message: 'Hello world' }));
routes.post('/user', _UserController2.default.store);
routes.post('/session', _SessionController2.default.store);
routes.get('/product', _ProductController2.default.index);
routes.get('/product/:id', _ProductController2.default.findById);

routes.use(_auth2.default);

routes.get('/roles', _RoleController2.default.index);

routes.put('/user', _UserController2.default.update);
routes.delete('/user/:userToBeDeleteId', _UserController2.default.deleteUser);
routes.put('/user/role/:userToUpdateRoleId', _UserController2.default.updateUserRole);
routes.put(
  '/user/password/:userToUpdatePasswordId',
  _UserController2.default.resetUserPassword
);
routes.get('/user', _UserController2.default.findById);
routes.get('/users', _UserController2.default.index);
routes.post('/users/avatar', upload.single('file'), _AvatarFileController2.default.store);

routes.post('/category', _CategoryController2.default.store);
routes.get('/categories', _CategoryController2.default.index);
routes.get('/category/byname', _CategoryController2.default.findByName);
routes.delete('/category/:id', _CategoryController2.default.delete);
routes.put('/category/:id', _CategoryController2.default.update);

routes.post('/product', _ProductController2.default.store);
routes.put('/product/:id', _ProductController2.default.update);
routes.delete('/product/:id', _ProductController2.default.delete);

routes.post(
  '/product/:id/file',
  upload.single('file'),
  _ProductFileController2.default.store
);

routes.delete('/product/:id/file', _ProductFileController2.default.delete);

routes.post('/client', _ClientController2.default.store);
routes.put('/client/:id', _ClientController2.default.update);
routes.delete('/client/:id', _ClientController2.default.delete);
routes.get('/clients', _ClientController2.default.index);

routes.post('/provider', _ProviderController2.default.store);
routes.put('/provider/:id', _ProviderController2.default.update);
routes.delete('/provider/:id', _ProviderController2.default.delete);
routes.get('/providers', _ProviderController2.default.index);

routes.post('/material', _MaterialController2.default.store);
routes.get('/materials', _MaterialController2.default.index);
routes.put('/material/:id', _MaterialController2.default.update);
routes.delete('/material/:id', _MaterialController2.default.delete);

routes.post('/measure', _MeasureController2.default.store);
routes.get('/measurements', _MeasureController2.default.index);
routes.put('/measure/:id', _MeasureController2.default.update);
routes.delete('/measure/:id', _MeasureController2.default.delete);

routes.post('/concreteDesignMaterial', _ConcreteDesignMaterialController2.default.store);
routes.put('/concreteDesignMaterial/', _ConcreteDesignMaterialController2.default.update);
routes.get('/concreteDesignMaterials', _ConcreteDesignMaterialController2.default.index);
routes.delete(
  '/concreteDesignMaterial/:id',
  _ConcreteDesignMaterialController2.default.delete
);

routes.post('/concreteDesign', _ConcreteDesignController2.default.store);
routes.put('/concreteDesign/:id', _ConcreteDesignController2.default.update);
routes.delete('/concreteDesign/:id', _ConcreteDesignController2.default.delete);
routes.get('/concreteDesigns', _ConcreteDesignController2.default.index);

routes.post('/compressionTest', _CompressionTestController2.default.store);
routes.put('/compressionTest/:id', _CompressionTestController2.default.update);
routes.delete('/compressionTest/:id', _CompressionTestController2.default.delete);
routes.get('/compressionTests', _CompressionTestController2.default.index);

routes.post('/concreteSample', _ConcreteSampleController2.default.store);
routes.put('/concreteSample/:id', _ConcreteSampleController2.default.update);
routes.delete('/concreteSample/:id', _ConcreteSampleController2.default.delete);
routes.get('/concreteSamples', _ConcreteSampleController2.default.index);

routes.post('/materialTransaction', _MaterialTransactionController2.default.store);
routes.get('/materialTransactions', _MaterialTransactionController2.default.index);
routes.delete('/materialTransaction/:id', _MaterialTransactionController2.default.delete);
routes.put('/materialTransaction/:id', _MaterialTransactionController2.default.update);

exports. default = routes;
