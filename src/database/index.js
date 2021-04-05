import Sequelize from 'sequelize';

import User from './models/User';
import Product from './models/Product';
import ProductFile from './models/ProductFile';
import Category from './models/Category';

import config from '../config/database';

const models = [User, Product, ProductFile, Category];

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
