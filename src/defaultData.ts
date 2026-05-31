import { Student, KasMasuk, Pengeluaran } from "./types";

export const DEFAULT_STUDENTS: Student[] = [
  { id: "s1", nama: "Muhammad Raihan", nis: "10201", kelas: "XII MIPA 1", username: "raihan", password: "123" },
  { id: "s2", nama: "Siti Aminah", nis: "10202", kelas: "XII MIPA 1", username: "siti", password: "123" },
  { id: "s3", nama: "Budi Santoso", nis: "10203", kelas: "XII MIPA 1", username: "budi", password: "123" },
  { id: "s4", nama: "Amanda Putri", nis: "10204", kelas: "XII MIPA 1", username: "amanda", password: "123" },
  { id: "s5", nama: "Ahmad Faisal", nis: "10205", kelas: "XII MIPA 1", username: "faisal", password: "123" },
  { id: "s6", nama: "Dewa Nyoman", nis: "10206", kelas: "XII MIPA 1", username: "dewa", password: "123" },
  { id: "s7", nama: "Farah Nabila", nis: "10207", kelas: "XII MIPA 1", username: "farah", password: "123" },
  { id: "s8", nama: "Jonathan Hartono", nis: "10208", kelas: "XII MIPA 1", username: "jonathan", password: "123" }
];

export const DEFAULT_KAS_MASUK: KasMasuk[] = [
  { id: "k1", siswa_id: "s1", nominal: 100000, tanggal: "2026-05-01", keterangan: "Uang kas bulan Mei Lunas" },
  { id: "k2", siswa_id: "s2", nominal: 100000, tanggal: "2026-05-02", keterangan: "Uang kas Mei Lunas" },
  { id: "k3", siswa_id: "s3", nominal: 50000, tanggal: "2026-05-03", keterangan: "Angsuran kas pertama" },
  { id: "k4", siswa_id: "s4", nominal: 100000, tanggal: "2026-05-05", keterangan: "Pembayaran kas lunas" },
  { id: "k5", siswa_id: "s6", nominal: 100000, tanggal: "2026-05-08", keterangan: "Bayar kas bulan Mei" },
  { id: "k6", siswa_id: "s7", nominal: 30000, tanggal: "2026-05-12", keterangan: "Bayar cicil kas" },
  { id: "k7", siswa_id: "s8", nominal: 100000, tanggal: "2026-05-14", keterangan: "Kas XII MIPA 1 Lunas" }
];

export const DEFAULT_EXPENSES: Pengeluaran[] = [
  { id: "e1", nama_pengeluaran: "Buku Kas & ATK", kategori: "ATK", nominal: 35000, tanggal: "2026-05-10", deskripsi: "Membeli buku jurnal kas, pulpen, dan penggaris bendahara kelas." },
  { id: "e2", nama_pengeluaran: "Perlengkapan Kebersihan Kelas", kategori: "Kebersihan", nominal: 45000, tanggal: "2026-05-12", deskripsi: "Membeli sapu lidi, sapu ijuk, kemoceng, dan tong sampah kecil." },
  { id: "e3", nama_pengeluaran: "Print & FC Tugas Kelompok", kategori: "Print Kebutuhan", nominal: 20000, tanggal: "2026-05-15", deskripsi: "Print tugas PPKN kelompok dan fotokopi materi sosiologi kelas." },
  { id: "e4", nama_pengeluaran: "Konsumsi Rapat Kas", kategori: "Konsumsi", nominal: 75000, tanggal: "2026-05-20", deskripsi: "Membeli air mineral gelas dan gorengan untuk rapat panitia pentas seni kelas." }
];

export const KAS_TARGET = 100000; // Target Kas per Siswa (Lunas)
