const Pool = require('pg-pool');
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: 'reviews_api',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  max: 20,
  idleTimeoutMillis: 1000,
  connectionTimeoutMillis: 3000
});
module.exports = pool;
