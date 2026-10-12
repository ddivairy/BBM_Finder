import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import 'dotenv/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Path file JSON bisa ditentukan lewat argumen CLI, default: spbu-bandung.json
const jsonPath = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(__dirname, 'spbu-bandung.json');

async function importData() {
  let db;

  try {
    console.log('Menghubungkan ke database...');

    // Konfigurasi dari .env (sama dengan backend/index.mjs)
    db = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: { rejectUnauthorized: false },
    });

    console.log('Koneksi database MySQL berhasil!');

    // --- Cek kolom yang benar-benar ada di tabel ---
    const [cols] = await db.query(
      `SELECT COLUMN_NAME FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'lokasi'`
    );
    const kolom = new Set(cols.map((c) => c.COLUMN_NAME));
    console.log(
      'Kolom terdeteksi:',
      [...kolom].join(', ')
    );

    // --- Baca file JSON ---
    console.log(`Membaca data dari ${jsonPath}...`);
    const fileContent = await fs.readFile(jsonPath, 'utf-8');
    const data = JSON.parse(fileContent);

    if (!Array.isArray(data.elements)) {
      throw new Error(
        'Format JSON tidak sesuai: properti "elements" tidak ditemukan.'
      );
    }

    console.log(`Ditemukan ${data.elements.length} lokasi dari OpenStreetMap.`);

    // --- Data yang sudah pernah diimport (kalau ada kolom external_id) ---
    let existing = new Set();
    if (kolom.has('external_id')) {
      const [rows] = await db.query(
        'SELECT external_id FROM lokasi WHERE external_id IS NOT NULL'
      );
      existing = new Set(rows.map((r) => String(r.external_id)));
    } else {
      const [rows] = await db.query(
        'SELECT nama, lintang, bujur FROM lokasi'
      );
      existing = new Set(
        rows.map((r) => `${r.nama}|${r.lintang}|${r.bujur}`)
      );
    }

    // --- Susun query sesuai kolom yang tersedia ---
    const nilaiBantuan = {
      external_id: null,
      status: 'disetujui', // hasil import dianggap sudah tervalidasi
    };

    const kolomInsert = [
      'nama', 'kategori', 'alamat', 'lintang', 'bujur',
      'tipe_bensin', 'jam_operasi', 'verifikasi_terakhir',
    ].filter((k) => kolom.has(k));

    if (kolom.has('external_id')) kolomInsert.push('external_id');
    if (kolom.has('status')) kolomInsert.push('status');

    const placeholders = kolomInsert.map(() => '?').join(', ');
    const query = `
      INSERT INTO lokasi (${kolomInsert.join(', ')})
      VALUES (${placeholders})
    `;

    let sukses = 0;
    let dilewati = 0;
    let gagal = 0;

    for (const element of data.elements) {
      const tags = element.tags || {};

      // Ambil nama
      const nama = tags.nama || tags.name || tags.ref || 'SPBU Pertamina';

      // Ambil alamat
      const alamat =
        tags.alamat ||
        tags['addr:street'] ||
        tags['addr:full'] ||
        'Alamat belum tersedia';

      // Kategori harus cocok dengan enum('spbu','eceran')
      let kategori = (tags.kategori || 'spbu').toLowerCase();
      if (kategori !== 'spbu' && kategori !== 'eceran') kategori = 'spbu';

      // Tipe bensin: bisa array atau string
      let tipeBensin = tags.tipe_bensin || ['Pertalite', 'Pertamax'];
      if (!Array.isArray(tipeBensin)) {
        tipeBensin = String(tipeBensin).split(',').map((s) => s.trim()).filter(Boolean);
      }
      const tipeBensinJSON = JSON.stringify(tipeBensin);

      const jamOperasi = tags.jam_operasi || '24 Jam';
      const verifikasi = tags.verifikasi_terakhir || null;

      // Node pakai lat/lon, Way/Relation pakai center.lat/center.lon
      const lintang = element.lat ?? element.center?.lat;
      const bujur = element.lon ?? element.center?.lon;

      if (lintang == null || bujur == null) {
        dilewati++;
        continue;
      }

      // Lewati data yang sudah pernah diimport (biar nggak dobel)
      const kunci = kolom.has('external_id')
        ? String(element.id)
        : `${nama}|${lintang}|${bujur}`;

      if (existing.has(kunci)) {
        dilewati++;
        continue;
      }

      // Susun nilai sesuai urutan kolomInsert
      const nilai = kolomInsert.map((k) => {
        switch (k) {
          case 'nama': return nama;
          case 'kategori': return kategori;
          case 'alamat': return alamat;
          case 'lintang': return lintang;
          case 'bujur': return bujur;
          case 'tipe_bensin': return tipeBensinJSON;
          case 'jam_operasi': return jamOperasi;
          case 'verifikasi_terakhir': return verifikasi;
          case 'external_id': return String(element.id);
          case 'status': return nilaiBantuan.status;
          default: return null;
        }
      });

      // Insert per baris — satu baris gagal nggak menghentikan sisanya
      try {
        await db.query(query, nilai);
        existing.add(kunci);
        sukses++;
      } catch (err) {
        gagal++;
        console.error(`  Gagal insert "${nama}": ${err.message}`);
      }
    }

    console.log('----------------------------------------');
    console.log(`Import selesai.`);
    console.log(`  Berhasil : ${sukses}`);
    console.log(`  Lewat    : ${dilewati} (sudah ada / tanpa koordinat)`);
    console.log(`  Gagal    : ${gagal}`);
    console.log('----------------------------------------');
  } catch (error) {
    console.error('Terjadi kesalahan saat import data:');
    if (error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
      console.error(
        '  -> Koneksi database gagal. Periksa DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_NAME di file backend/.env'
      );
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('  -> Username/password database salah.');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error(
        `  -> Database "${process.env.DB_NAME}" tidak ditemukan.`
      );
    } else if (error.code === 'ENOENT') {
      console.error(`  -> File JSON tidak ditemukan: ${jsonPath}`);
    } else {
      console.error(' ', error.message);
    }
    process.exitCode = 1;
  } finally {
    if (db) await db.end();
  }
}

importData();
