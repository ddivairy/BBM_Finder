import db from "./config/db.mjs";

const Lokasi = {
    // Mengambil data seluruh lokasi
    getAll: async () => {
        const [rows] = await db.execute('SELECT * FROM lokasi');
        return rows;
    },

    // Mengambil data berdasarkan nama
    getByNama: async (nama) => {
        const query = 'SELECT * FROM lokasi WHERE nama LIKE ?';
        const [rows] = await db.execute(query, [`%${nama}%`]);
        return rows;
    },

    //Menambah siswa baru
    create: async (nama, 
            kategori, 
            alamat, 
            lintang, 
            bujur, 
            tipe_bensin, 
            jam_operasi,
            verifikasi_terakhir) => {
        const query = "INSERT INTO lokasi (nama, kategori, alamat, lintang, bujur, tipe_bensin, jam_operasi, verifikasi_terakhir) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        const [result] = await db.execute(query, [
            nama, 
            kategori, 
            alamat, 
            lintang, 
            bujur, 
            JSON.stringify(tipe_bensin), 
            jam_operasi,
            verifikasi_terakhir || new Date().toISOString().split("T")[0]
        ]);
        return result.insertId;
    },

    //Memperbarui data siswa
    update: async (nama, 
            kategori, 
            alamat, 
            lintang, 
            bujur, 
            tipe_bensin, 
            jam_operasi,
            verifikasi_terakhir) => {
        const query = 'UPDATE  lokasi (nama, kategori, alamat, lintang, bujur, tipe_bensin, jam_operasi, verifikasi_terakhir) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        const [result] = await db.execute(query, [
            nama, 
            kategori, 
            alamat, 
            lintang, 
            bujur, 
            JSON.stringify(tipe_bensin), 
            jam_operasi,
            verifikasi_terakhir || new Date().toISOString().split("T")[0]
        ]);
        return result.affectedRows;
    },

    //Menghapus data siswa
    delete: async (id) => {
        const query = 'DELETE FROM lokasi WHERE id = ?';
        const [result] = await db.execute(query, [id]);
        return result.affectedRows;
    }
};
