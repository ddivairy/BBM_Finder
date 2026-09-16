import mysql from "mysql2/promise"

console.log("Menghubungkan ke database...")

const db = await mysql.createConnection({
  host: "localhost",
  user: 'root',
  password: 'Taleshero100',
  database: 'BBM_Finder'
});

console.log("Koneksi database MySQL berhasil!")

export default db;