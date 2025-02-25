const { Client } = require('pg');
require('dotenv').config();

// ایجاد اتصال به دیتابیس
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

client.connect()
  .then(() => console.log("✅ Connected to Neon PostgreSQL"))
  .catch(err => console.error("❌ Connection error", err));

module.exports = client;
