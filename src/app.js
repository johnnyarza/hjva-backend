import 'dotenv/config';

import express from 'express';
import morgan from 'morgan';
import path from 'path';
import Youch from 'youch';
import cors from 'cors';
import 'express-async-errors';
import routes from './routes';
import './database/index';

class App {
  constructor() {
    this.server = express();
    this.middlewares();
    this.routes();
  }

  middlewares() {
    this.server.use(cors());
    this.server.use(express.json());
    this.server.use(morgan('dev'));
    this.server.use(
      '/files',
      express.static(path.resolve(__dirname, '..', 'tmp', 'uploads'))
    );
  }

  routes() {
    this.server.use(routes);
    this.server.use(this.defaultErrorHandler);
  }

  async defaultErrorHandler(err, req, res, next) {
    const errors = await new Youch(err, req).toJSON();

    if (res.headersSent) {
      return next(errors);
    }
    return res.status(500).json(errors);
  }
}

export default new App().server;
