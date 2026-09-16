import Lokasi from '../models/lokasiModel.mjs';

export const getSemuaLokasi = async (req, res) => {
    try {
        const lokasi = await Lokasi.getAll(req.params.id);
        if (!lokasi) {
            return res.status(404).json({ message: 'Lokasi tidak ditemukan' });
        }
        res.status(200).json(lokasi);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const cariLokasiByNama = async (req, res) => {
    try {
        const namaDicari = req.params.nama;
        const lokasi = await Lokasi.getByNama(namaDicari);
        if (lokasi.length === 0) {
            return res.status(404).json({ message: `Lokasi dengan nama '${namaDicari}' tidak ditemukan` });
        }
        res.status(200).json(lokasi);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const tambahLokasi = async (req, res) => {
    try {
        const {
            nama, 
            kategori, 
            alamat, 
            lintang, 
            bujur, 
            tipe_bensin, 
            jam_operasi
        } = req.body;
        if (!nama || !kategori || !lintang || !bujur || !tipe_bensin) {
            return res.status(400).json({ message: "Data wajib belum lengkap." });
        }

        const lat = parseFloat(lintang);
        const lng = parseFloat(bujur);

        if (isNaN(lat) || lat < -90 || lat > 90) {
            return res.status(400).json({ message: 'Lintang harus berupa angka desimal antara -90 hingga 90' });
        }

        if (isNaN(lng) || lng < -180 || lng > 180) {
            return res.status(400).json({ message: 'Bujur harus berupa angka desimal antara -180 hingga 180' });
        }

        const id = await Lokasi.create (
            nama, 
            kategori, 
            alamat, 
            lintang, 
            bujur, 
            tipe_bensin, 
            jam_operasi);
        res.status(201).json({
            message: 'Lokasi berhasil ditambahkan',
            lokasiId: id
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Lokasi sudah terdaftar' });
        }
        res.status(500).json({ error: error.message });
    }
};

export const updateLokasi = async (req, res) => {
    try {
        const { 
            nama, 
            kategori, 
            alamat, 
            lintang, 
            bujur, 
            tipe_bensin, 
            jam_operasi
        } = req.body;
        if (!nama || !kategori || !lintang || !bujur || !tipe_bensin) {
            return res.status(400).json({ message: "Data wajib belum lengkap." });
        }
        const lat = parseFloat(lintang);
        const lng = parseFloat(bujur);

        if (isNaN(lat) || lat < -90 || lat > 90) {
            return res.status(400).json({ message: 'Lintang harus berupa angka desimal antara -90 hingga 90' });
        }

        if (isNaN(lng) || lng < -180 || lng > 180) {
            return res.status(400).json({ message: 'Bujur harus berupa angka desimal antara -180 hingga 180' });
        }
        const affectedRows = await Lokasi.update(
            req.params.id,
            nama, 
            kategori, 
            alamat, 
            lintang, 
            bujur, 
            tipe_bensin, 
            jam_operasi
        );
        if (affectedRows === 0) {
            return res.status(404).json({ message: 'Lokasi tidak ditemukan' });
        }
        res.status(200).json({ message: 'Lokasi berhasil diperbarui' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Lokasi sudah terdaftar' });
        }
        res.status(500).json({ error: error.message });
    }
};

export const hapusLokasi = async (req, res) => {
    try {
        const affectedRows = await Lokasi.delete(req.params.id);
        if (affectedRows === 0) {
            return res.status(404).json({ message: 'Lokasi tidak ditemukan' });
        }
        res.status(200).json({ message: 'Lokasi berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
