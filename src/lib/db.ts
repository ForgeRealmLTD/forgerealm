import { createPool } from "mysql2/promise";

if (!process.env.DB_HOST) {
  throw new Error("DB_HOST environment variable is not set");
}

if (!process.env.DB_USER) {
  throw new Error("DB_USER environment variable is not set");
}

if (!process.env.DB_NAME) {
  throw new Error("DB_NAME environment variable is not set");
}

const config: any = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Only add password if provided
if (process.env.DB_PASS) {
  config.password = process.env.DB_PASS;
}

const pool = createPool(config);

export default pool;
