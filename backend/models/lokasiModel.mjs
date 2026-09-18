import db from "./config/db.mjs";

const Lokasi = {
    // Mengambil seluruh lokasi
    getAll: async () => {
        const [rows] = await db.execute(
            'SELECT * FROM lokasi'
        );
        return rows;
    },

    // Mencari lokasi berdasarkan nama, alamat, atau jenis BBM
    getByNama: async (keyword) => {
        const query = `
            SELECT *
            FROM lokasi
            WHERE 
                nama LIKE ?
                OR alamat LIKE ?
                OR tipe_bensin LIKE ?
        `;

        const searchKeyword = `%${keyword}%`;

        const [rows] = await db.execute(query, [
            searchKeyword,
            searchKeyword,
            searchKeyword
        ]);

        return rows;
    },

    // Menambah lokasi
    create: async (
        nama,
        kategori,
        alamat,
        lintang,
        bujur,
        tipe_bensin,
        jam_operasi,
        verifikasi_terakhir
    ) => {
        const query = `
            INSERT INTO lokasi
            (
                nama,
                kategori,
                alamat,
                lintang,
                bujur,
                tipe_bensin,
                jam_operasi,
                verifikasi_terakhir
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await db.execute(query, [
            nama,
            kategori,
            alamat,
            lintang,
            bujur,
            JSON.stringify(tipe_bensin),
            jam_operasi,
            verifikasi_terakhir ||
                new Date().toISOString().split("T")[0]
        ]);

        return result.insertId;
    },

    // Memperbarui lokasi
    update: async (
        id,
        nama,
        kategori,
        alamat,
        lintang,
        bujur,
        tipe_bensin,
        jam_operasi,
        verifikasi_terakhir
    ) => {
        const query = `
            UPDATE lokasi
            SET
                nama = ?,
                kategori = ?,
                alamat = ?,
                lintang = ?,
                bujur = ?,
                tipe_bensin = ?,
                jam_operasi = ?,
                verifikasi_terakhir = ?
            WHERE id = ?
        `;

        const [result] = await db.execute(query, [
            nama,
            kategori,
            alamat,
            lintang,
            bujur,
            JSON.stringify(tipe_bensin),
            jam_operasi,
            verifikasi_terakhir ||
                new Date().toISOString().split("T")[0],
            id
        ]);

        return result.affectedRows;
    },

    // Menghapus lokasi
    delete: async (id) => {
        const query = `
            DELETE FROM lokasi
            WHERE id = ?
        `;

        const [result] = await db.execute(query, [id]);

        return result.affectedRows;
    }
};

export default Lokasi;