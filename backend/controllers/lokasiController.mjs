export const getSemuaLokasi = async (req, res) => {
    try {
        const lokasi = await Lokasi.getAll();

        res.status(200).json(lokasi);
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

export const cariLokasiByNama = async (req, res) => {
    try {
        const namaDicari = req.params.nama;

        if (!namaDicari || !namaDicari.trim()) {
            return res.status(400).json({
                message: 'Kata pencarian tidak boleh kosong'
            });
        }

        const lokasi = await Lokasi.getByNama(namaDicari.trim());

        res.status(200).json(lokasi);
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};