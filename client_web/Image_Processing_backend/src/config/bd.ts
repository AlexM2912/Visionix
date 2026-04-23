import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

function createPool(database: string) {
  return mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
}

export const authDb = createPool(
  process.env.AUTH_DB_NAME || process.env.DB_NAME || "bd_autenticacion"
);

export const processingDb = createPool(
  process.env.PROCESSING_DB_NAME || "bd_procesamiento_imagenes"
);
