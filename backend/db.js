const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' });

const connectionString = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;

const pool = new Pool({
    connectionString,
    // Enable SSL for Neon and other cloud databases
    ssl: connectionString && !connectionString.includes('localhost') ? { rejectUnauthorized: false } : false,
    // Fallback to individual variables if connectionString fails
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool
};
