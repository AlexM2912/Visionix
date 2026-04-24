import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// AUTH DB
export const authDb = mysql.createPool({
  host: process.env.DB_AUTH_HOST,
  port: Number(process.env.DB_AUTH_PORT),
  user: process.env.DB_AUTH_USER,
  password: process.env.DB_AUTH_PASSWORD,
  database: process.env.DB_AUTH_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// PROCESSING DB
export const processingDb = mysql.createPool({
  host: process.env.DB_PROCESS_HOST,
  port: Number(process.env.DB_PROCESS_PORT),
  user: process.env.DB_PROCESS_USER,
  password: process.env.DB_PROCESS_PASSWORD,
  database: process.env.DB_PROCESS_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});