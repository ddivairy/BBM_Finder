-- Komunitas Pengecer Bensin: info bensin eceran yang ready subuh
-- Jalankan sekali di database BBM Finder kamu

CREATE TABLE IF NOT EXISTS info_pengecer (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    lokasi_id INT DEFAULT NULL,          -- NULL = lokasi tulis bebas
    tempat VARCHAR(150) DEFAULT NULL,    -- nama tempat kalau tulis bebas
    teks TEXT NOT NULL,                  -- isi info (bebas, gaya Facebook)
    dibuat_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    KEY idx_info_waktu (dibuat_pada)
);

CREATE TABLE IF NOT EXISTS info_like (
    id INT AUTO_INCREMENT PRIMARY KEY,
    info_id INT NOT NULL,
    user_id INT NOT NULL,
    UNIQUE KEY uq_info_user (info_id, user_id)
);
