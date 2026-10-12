-- Tambahkan status verifikasi untuk akun yang sudah ada.
-- Default disetujui mempertahankan akses akun lama; pendaftaran baru berstatus pending.

ALTER TABLE User
    ADD COLUMN status_verifikasi ENUM('pending','disetujui','ditolak')
    NOT NULL DEFAULT 'disetujui' AFTER role;
