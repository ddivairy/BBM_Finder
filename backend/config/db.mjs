import mysql from "mysql2/promise"
import "dotenv/config"

console.log("Menghubungkan ke database...")

const db = await mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  enableKeepAlive: true,
  keepAliveInitialDelay: 10000
});

console.log("Koneksi database MySQL berhasil!")

setInterval(async () => {
  try {
    await db.query("SELECT 1");
    console.log("DB masih hidup");
  } catch (error) {
    console.error("DB CONNECTION ERROR:", error);
  }
}, 30000);

export default db;