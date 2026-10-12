-- Migrasi tabel lokasi: kolom penyumbang + status persetujuan admin
-- Jalankan sekali di database BBM Finder kamu

ALTER TABLE lokasi
    ADD COLUMN ditambahkan_oleh INT DEFAULT NULL AFTER external_id,
    ADD COLUMN status ENUM('pending','disetujui','ditolak') NOT NULL DEFAULT 'disetujui' AFTER ditambahkan_oleh;

-- Lokasi lama dianggap sudah disetujui (default 'disetujui' sudah benar),
-- jadi tidak perlu UPDATE tambahan kecuali kamu sudah pernah ubah default-nya:
-- UPDATE lokasi SET status = 'disetujui' WHERE status IS NULL;

-- (Opsional) relasi ke tabel User — aktifkan kalau ingin integritas FK:
-- ALTER TABLE lokasi
--     ADD CONSTRAINT fk_lokasi_user
--     FOREIGN KEY (ditambahkan_oleh) REFERENCES User(id)
--     ON DELETE SET NULL;
