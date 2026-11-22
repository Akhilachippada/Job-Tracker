const mysql = require('mysql2/promise');

module.exports = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'job_tracker',
  dateStrings: true, // return DATE columns as 'YYYY-MM-DD' strings
  waitForConnections: true,
  connectionLimit: 10,
});
