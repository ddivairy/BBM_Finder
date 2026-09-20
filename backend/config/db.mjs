import mysql from "mysql2/promise"

console.log("Menghubungkan ke database...")

const db = await mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'BBM_Finder'
});

console.log("Koneksi database MySQL berhasil!")

export default db;