module.exports = {
  dialect: 'postgres',
  host: process.env.DB_HOST,
  username: 'postgres',
  password: 'docker',
  database: 'hjva',
  define: {
    timestamp: true,
    underscored: true,
    underscoredAll: false,
  },
};
