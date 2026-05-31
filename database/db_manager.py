import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "bendahara_kelas.db")

def get_connection():
    """Mendapatkan koneksi ke database SQLite."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Inisialisasi tabel database dan data awal jika belum ada."""
    db_dir = os.path.dirname(DB_PATH)
    if db_dir and not os.path.exists(db_dir):
        os.makedirs(db_dir, exist_ok=True)
        
    conn = get_connection()
    cursor = conn.cursor()
    
    # 1. Tabel Users (khusus Admin/Bendahara)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL
    )
    """)
    
    # 2. Tabel Siswa
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS siswa (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nama TEXT NOT NULL,
        nis TEXT UNIQUE NOT NULL,
        kelas TEXT NOT NULL,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    )
    """)
    
    # 3. Tabel Kas Masuk
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS kas_masuk (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        siswa_id INTEGER NOT NULL,
        nominal REAL NOT NULL,
        tanggal TEXT NOT NULL,
        keterangan TEXT,
        FOREIGN KEY (siswa_id) REFERENCES siswa(id) ON DELETE CASCADE
    )
    """)
    
    # 4. Tabel Pengeluaran
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS pengeluaran (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nama_pengeluaran TEXT NOT NULL,
        kategori TEXT NOT NULL,
        nominal REAL NOT NULL,
        tanggal TEXT NOT NULL,
        deskripsi TEXT
    )
    """)
    
    # Masukkan data default admin jika belum ada
    cursor.execute("SELECT COUNT(*) FROM users")
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
        INSERT INTO users (username, password, role)
        VALUES ('admin', 'admin123', 'admin')
        """)
        
    # Masukkan beberapa data siswa awal sebagai contoh jika kosong
    cursor.execute("SELECT COUNT(*) FROM siswa")
    if cursor.fetchone()[0] == 0:
        siswa_default = [
            ("Muhammad Raihan", "10201", "XII MIPA 1", "raihan", "123"),
            ("Siti Aminah", "10202", "XII MIPA 1", "siti", "123"),
            ("Budi Santoso", "10203", "XII MIPA 1", "budi", "123"),
            ("Amanda Putri", "10204", "XII MIPA 1", "amanda", "123"),
            ("Ahmad Faisal", "10205", "XII MIPA 1", "faisal", "123"),
            ("Dewa Nyoman", "10206", "XII MIPA 1", "dewa", "123"),
            ("Farah Nabila", "10207", "XII MIPA 1", "farah", "123"),
            ("Jonathan Hartono", "10208", "XII MIPA 1", "jonathan", "123")
        ]
        cursor.executemany("""
        INSERT INTO siswa (nama, nis, kelas, username, password)
        VALUES (?, ?, ?, ?, ?)
        """, siswa_default)
        
        # Masukkan transaksi kas masuk awal
        kas_default = [
            (1, 100000, "2026-05-01", "Uang kas bulan Mei Lunas"),
            (2, 100000, "2026-05-02", "Uang kas Mei Lunas"),
            (3, 50000, "2026-05-03", "Angsuran kas pertama"),
            (4, 100000, "2026-05-05", "Pembayaran kas lunas"),
            (6, 100000, "2026-05-08", "Bayar kas bulan Mei"),
            (7, 30000, "2026-05-12", "Bayar cicil kas"),
            (8, 100000, "2026-05-14", "Kas XII MIPA 1 Lunas"),
        ]
        cursor.executemany("""
        INSERT INTO kas_masuk (siswa_id, nominal, tanggal, keterangan)
        VALUES (?, ?, ?, ?)
        """, kas_default)
        
        # Masukkan transaksi pengeluaran awal
        pengeluaran_default = [
            ("Buku Kas & ATK", "ATK", 35000, "2026-05-10", "Membeli buku jurnal kas, pulpen, dan penggaris bendahara kelas."),
            ("Perlengkapan Kebersihan Kelas", "Kebersihan", 45000, "2026-05-12", "Membeli sapu lidi, sapu ijuk, kemoceng, dan tong sampah kecil."),
            ("Print & FC Tugas Kelompok", "Print Kebutuhan", 20000, "2026-05-15", "Print tugas PPKN kelompok dan fotokopi materi sosiologi kelas."),
            ("Konsumsi Rapat Kas", "Konsumsi", 75000, "2026-05-20", "Membeli air mineral-mineral dan snack untuk rapat.")
        ]
        cursor.executemany("""
        INSERT INTO pengeluaran (nama_pengeluaran, kategori, nominal, tanggal, deskripsi)
        VALUES (?, ?, ?, ?, ?)
        """, pengeluaran_default)
        
    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("Database berhasil diinisialisasi di:", DB_PATH)
