import Sequelize from 'sequelize';

import User from './models/User';
import Product from './models/Product';
import ProductFile from './models/ProductFile';
import Category from './models/Category';
import Role from './models/Role';
import Avatar from './models/Avatar';
import Client from './models/Client';
import Provider from './models/Provider';

import config from '../config/database';

const models = [
  Client,
  User,
  Product,
  ProductFile,
  Category,
  Role,
  Avatar,
  Provider,
];

class Database {
  constructor() {
    this.init();
  }

  init() {
    this.connection = new Sequelize(config);
    models.map((model) => model.init(this.connection));
    models.map(
      (model) => model.associate && model.associate(this.connection.models)
    );
  }
}

export default new Database();
