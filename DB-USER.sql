-- Tabel User untuk autentikasi (register, login & tambah lokasi)
-- Jalankan sekali di database BBM Finder kamu

CREATE TABLE IF NOT EXISTS User (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('user','admin') NOT NULL DEFAULT 'user',
    token VARCHAR(64) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Kalau tabel User sudah ada dari sebelumnya, jalankan ini:
-- ALTER TABLE User
--     ADD COLUMN role ENUM('user','admin') NOT NULL DEFAULT 'user' AFTER password,
--     ADD COLUMN token VARCHAR(64) DEFAULT NULL AFTER role;
