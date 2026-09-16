DROP DATABASE IF EXISTS BBM_Finder;

CREATE DATABASE IF NOT EXISTS BBM_Finder; 		

USE BBM_Finder;

DROP TABLE IF EXISTS Lokasi;

CREATE TABLE Lokasi (
	id INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(150) NOT NULL,
    kategori ENUM('SPBU', 'eceran') NOT NULL DEFAULT 'eceran',
    alamat TEXT,
    lintang DECIMAL (10, 8) NOT NULL,
    bujur DECIMAL (11, 8) NOT NULL,
    tipe_bensin JSON NOT NULL,
    jam_operasi VARCHAR(100) DEFAULT '24 Jam',
    verifikasi_terakhir DATE NOT NULL,
    dibuat_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO Lokasi
(nama, 
kategori, 
alamat, 
lintang, 
bujur, 
tipe_bensin, 
jam_operasi,
verifikasi_terakhir)
VALUES
('SPBU Pertamina 34.402.18 Martanegara Asri',
'SPBU',
'Jl. Martanegara, Lkr. Sel., Bandung, Kota Bandung, Jawa Barat 40263',
-6.932857693796542,
107.62800439981284,
'["Pertalite, Pertamax"]',
DEFAULT,
CURRENT_DATE
);

SELECT *
FROM Lokasi;