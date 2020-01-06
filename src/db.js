const { Client } = require('pg');
const connection = {
  user: 'admin',
  password: 'p@ssword',
  database: 'reviews_api',
  host: 'db',
  port: 5432
};

module.exports = new Client(connection);
