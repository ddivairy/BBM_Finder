-- Tabel laporan keramaian SPBU (sepi / normal / ramai)
-- Jalankan sekali di database BBM Finder kamu

CREATE TABLE IF NOT EXISTS laporan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lokasi_id INT NOT NULL,
    user_id INT NOT NULL,
    status ENUM('sepi','normal','ramai') NOT NULL,
    komentar TEXT,
    dibuat_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    KEY idx_laporan_lokasi (lokasi_id),
    KEY idx_laporan_waktu (dibuat_pada)
);

CREATE TABLE IF NOT EXISTS laporan_like (
    id INT AUTO_INCREMENT PRIMARY KEY,
    laporan_id INT NOT NULL,
    user_id INT NOT NULL,
    UNIQUE KEY uq_laporan_user (laporan_id, user_id)
);
