require('dotenv').config();

module.exports = {
  dialect: 'postgres',
  host: process.env.DB_HOST,
  username: 'postgres',
  password: '1a2b3c4d5e6f',
  database: 'hjva',
  define: {
    timestamp: true,
    underscored: true,
    underscoredAll: false,
  },
};
