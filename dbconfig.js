require("dotenv").config(); // Ensure this is a function call

const { Pool } = require("pg"); // Import `Pool` correctly

// Check the environment
const isProduction = process.env.NODE_ENV === "production";

// Build the connection string for development
const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`;

// Create the Pool instance
const pool = new Pool({
  connectionString: isProduction ? process.env.DATABASE_URL : connectionString,
  ssl: isProduction
    ? { rejectUnauthorized: false } // Ensure this for Render's PostgreSQL
    : false,
});

module.exports = { pool };
