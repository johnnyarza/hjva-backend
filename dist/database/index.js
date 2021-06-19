"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _sequelize = require('sequelize'); var _sequelize2 = _interopRequireDefault(_sequelize);

var _User = require('./models/User'); var _User2 = _interopRequireDefault(_User);
var _Product = require('./models/Product'); var _Product2 = _interopRequireDefault(_Product);
var _ProductFile = require('./models/ProductFile'); var _ProductFile2 = _interopRequireDefault(_ProductFile);
var _Category = require('./models/Category'); var _Category2 = _interopRequireDefault(_Category);
var _Role = require('./models/Role'); var _Role2 = _interopRequireDefault(_Role);
var _Avatar = require('./models/Avatar'); var _Avatar2 = _interopRequireDefault(_Avatar);
var _Client = require('./models/Client'); var _Client2 = _interopRequireDefault(_Client);
var _Provider = require('./models/Provider'); var _Provider2 = _interopRequireDefault(_Provider);
var _Material = require('./models/Material'); var _Material2 = _interopRequireDefault(_Material);
var _Measure = require('./models/Measure'); var _Measure2 = _interopRequireDefault(_Measure);
var _ConcreteDesign = require('./models/ConcreteDesign'); var _ConcreteDesign2 = _interopRequireDefault(_ConcreteDesign);
var _CompressionTest = require('./models/CompressionTest'); var _CompressionTest2 = _interopRequireDefault(_CompressionTest);
var _ConcreteSample = require('./models/ConcreteSample'); var _ConcreteSample2 = _interopRequireDefault(_ConcreteSample);
var _ConcreteDesignMaterial = require('./models/ConcreteDesignMaterial'); var _ConcreteDesignMaterial2 = _interopRequireDefault(_ConcreteDesignMaterial);
var _MaterialTransaction = require('./models/MaterialTransaction'); var _MaterialTransaction2 = _interopRequireDefault(_MaterialTransaction);

var _database = require('../config/database'); var _database2 = _interopRequireDefault(_database);

const models = [
  _MaterialTransaction2.default,
  _ConcreteSample2.default,
  _CompressionTest2.default,
  _ConcreteDesignMaterial2.default,
  _ConcreteDesign2.default,
  _Client2.default,
  _User2.default,
  _Product2.default,
  _ProductFile2.default,
  _Category2.default,
  _Role2.default,
  _Avatar2.default,
  _Provider2.default,
  _Material2.default,
  _Measure2.default,
];

class Database {
  constructor() {
    this.init();
  }

  init() {
    this.connection = new (0, _sequelize2.default)(_database2.default);
    models.map((model) => model.init(this.connection));
    models.map(
      (model) => model.associate && model.associate(this.connection.models)
    );
  }
}

exports. default = new Database();
