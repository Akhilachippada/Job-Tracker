const mysql = require('mysql2/promise');

async function initDb() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  });
  const name = process.env.DB_NAME || 'job_tracker';
  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${name}\``);
  await conn.query(`USE \`${name}\``);
  await conn.query(`CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);
  await conn.query(`CREATE TABLE IF NOT EXISTS jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    company VARCHAR(150) NOT NULL,
    position VARCHAR(150) NOT NULL,
    location VARCHAR(150),
    status ENUM('Wishlist','Applied','Interview','Offer','Rejected') NOT NULL DEFAULT 'Applied',
    applied_date DATE,
    interview_date DATE,
    interview_details TEXT,
    job_url VARCHAR(500),
    salary VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);
  await conn.end();
  console.log('Database ready');
}

module.exports = { initDb };
